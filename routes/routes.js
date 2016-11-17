'use strict'
const Promise = require('bluebird');
const distance = require('../helpers/distance');
const db = require('../db/connection');
const request = require('request');
const rp = require('request-promise');
const jStat = require('jStat').jStat;
const planeInfo = require('../data/planes');
const carInfo = require('../data/cars');
const timeCalc = require('../helpers/time')
const normalizers = require('../data/averages')


module.exports = function(app) {

//retrieving all US airports
  app.get('/api/airports', (req, res) => {
    db.Airports.findAll({
      where: {
        Country: 'United States'
      },
      raw: true
    })
    .then((airports) => {
      res.status(200).send(airports)
    })
  })

  app.get('/api/normalizers', (req, res) => {
    let origin = [39.95,-75.17];//DCA
    let destination = [33.74,-84.38]; //JFK
    let dist = distance.calculateDist(origin, destination)
    const averageObj = {
      distance: dist,
      hours: normalizers.timeCalc(dist) * dist,
      price: normalizers.costCalc(dist) * dist,
      co2: normalizers.emissions * dist
    }
    res.status(200).send(averageObj)
  })
  // Retreive car distance and location data
  app.get('/api/cars', (req,res) => {
    let api_key = 'AIzaSyActkAY-HutxFQ7CS9-VJQUptb0M5IRl6k';
    //example data
    // let origin = [37.618972,-122.374889];//SFO
    let origin = [39.95,-75.17];//DCA
    let destination = [33.74,-84.38]; //JFK
    const options = {
      url:`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origin}&destinations=${destination}&key=${api_key}`
    };
    request(options, (err, response, body) => {
      if (err) {
        console.log(err);
      }
      /* SAMPLE RESPONSE:
        {
          "destination_addresses" : [ "Terminal 4, Jamaica, NY 11430, USA" ],
          "origin_addresses" : [ "Terminal 2, San Francisco, CA 94128, USA" ],
          "rows" : [ {
            "elements" : [ {
              "distance" : { "text" : "2,940 mi", "value" : 4732132 },
              "duration" : { "text" : "1 day 19 hours", "value" : 153012 }, "status" : "OK"
            } ]
          } ],
          "status" : "OK"
        }
      */
      //parsing data for distance output in meters, converted to miles
      const MetersPerMile = 1609.34;
      let distance = JSON.parse(body).rows[0].elements[0].distance.value/MetersPerMile; //2940 Miles

      //parsing data for time output in seconds, converted to hours
      const SecondsPerHour = 3600;
      let carTime = JSON.parse(body).rows[0].elements[0].duration.value/SecondsPerHour;//1 day 19 hrs
      let carTimeText = JSON.parse(body).rows[0].elements[0].duration.text;//1 day 19 hrs

      let emissionPerMileSml = .8;
      let emissionPerMileMed = 1.0;
      let emissionPerMileLrg = 1.2;  //1.2 for light truck/SUV

      const carEmissions = ((emissionPerMileSml+emissionPerMileMed+ emissionPerMileLrg) / 3)*distance;

      let costPerMileSml = .1239;
      let costPerMileMed = .1472;
      let costPerMileLrg = .1812;

      const costPerMile = (costPerMileSml+costPerMileMed+costPerMileLrg)/3;
      const carCost = distance*costPerMile;

      const responseObj = {
        carCost: carCost,//Dollars
        carEmissions: carEmissions,//lbs of CO2
        carTime: carTime,//hours
        carTimeText: carTimeText
      } ;

      res.status(200).send(JSON.stringify(responseObj));
    });
  });


  app.get('/api/planes', (req, res) => {

    let market = 'US';
    let currency = 'USD';
    let locale = 'en-US';
    let origin = 'PHL';
    let destination = 'ATL';
    let outboundDate = '2016-12-11';
    let locationSchema = 'Iata';
    let passengers = 1;
    let year = outboundDate.slice(0, 4);
    let month = outboundDate.slice(5, 7);
    let day = outboundDate.slice(8, 10);
    let pointA = [39, -104]
    let pointB = [33, -84]
    let planeDist = distance.calculateDist(pointA, pointB); //DEN to ATL


    let planeStats = {
      emissions: Math.round(planeDist * planeInfo.planeEmissions.perMile*100)/100
      //lbs of CO2
    }

    // url for flight time
    let url = `https://api.flightstats.com/flex/schedules/rest/v1/json/from/${origin}/to/${destination}/departing/${year}/${month}/${day}?appId=${process.env.FLIGHTSTATS_API_ID}&appKey=${process.env.FLIGHTSTATS_API_KEY}`;
    // url for flight price
    let options = {
      url: `http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/${market}/${currency}/${locale}/${origin}/${destination}/${outboundDate}/?apiKey=${process.env.SKYSCANNER_API_KEY}`
    }
    var arrivalTZAdjust;
    var departureTZAdjust;
    const p1 = rp(url)
      .then(body => {
        return new Promise ((resolve, reject) => {
          body = JSON.parse(body);
          db.Airports.findOne({
            where: {
              FAA_IATA: destination
            },
            raw: true
          })
          .then(airport1 => {
            arrivalTZAdjust = airport1.Timezone
            db.Airports.findOne({
            where: {
              FAA_IATA: origin
            },
            raw: true
            })
            .then(airport2 => {
              // calculate time of flight, adjusting for timezone difference
                departureTZAdjust = airport2.Timezone
                let times = body.scheduledFlights.map(flight => {
                  let arrival = new Date(flight.arrivalTime);
                  let departure = new Date(flight.departureTime);
                  let utc1 = Date.UTC(arrival.getFullYear(), arrival.getMonth(), arrival.getDate(), arrival.getHours(), arrival.getMinutes())
                  let utc2 = Date.UTC(departure.getFullYear(), departure.getMonth(), departure.getDate(), departure.getHours(), departure.getMinutes())
                  let adjust = arrivalTZAdjust - departureTZAdjust;
                  return (utc1 - utc2) / 1000 / 60 / 60 - adjust
                })
                // add .5 to account for runway time
                let avgTime = jStat.mean(times) + .5
                resolve({time: avgTime, timeString: timeCalc(avgTime)})
            })
          })
        })
      })
    const p2 = rp(options)
      .then(body => {
        return new Promise ((resolve, reject) => {
          body = JSON.parse(body)
          if (body.Quotes.length === 0) {
            outboundDate = outboundDate.slice(0, -3);
            let options = {
              url: `http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/${market}/${currency}/${locale}/${origin}/${destination}/${outboundDate}/?apiKey=${process.env.SKYSCANNER_API_KEY}`
            }
            request(options, (err, response, body) => {
              if (err) {
                console.log(err)
              }
              body = JSON.parse(body)
              // Get array of prices
              let priceArray = body.Quotes.map(quote => quote.MinPrice);
              // Generate statistics object
              let jStatPrices = jStat(priceArray);
              // Find mean and standard deviation
              let meanPrice = jStatPrices.mean();
              let range = jStatPrices.stdev()
              // Filter to prices within 2.5 stdevs of the mean
              let filteredPrices = priceArray.filter(price => {
                return price < meanPrice + range * 2.5 && price > meanPrice - range * 2.5
              })
              // Generate stats object from filtered prices
              let filteredJStatPrices = jStat(filteredPrices);
              let minPrice = filteredJStatPrices.min()
              resolve({price: minPrice, type: 'average', emissons: planeStats.emissions})
            })
          } else {
            let minPrice = body.Quotes[0].MinPrice
            resolve({price: minPrice, type: 'single day', emissons: planeStats.emissions})
          }
        })
      })
    Promise.all([p1, p2])
    .catch(error => console.log(error))
    .then(results => {
      const finalObj = Object.assign({}, results[0], results[1])
      res.status(200).send(finalObj)
    })
  })
}


  // Open session to populate prices
  // Need live flight data access to use this method
  // Waiting on API key
  // request
  //   .post({
  //     url: 'http://partners.api.skyscanner.net/apiservices/pricing/v1.0',
  //     headers: {
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //       'Accept': 'application/json'
  //     },
  //     form: {
  //       apiKey: process.env.SKYSCANNER_API_KEY,
  //       country: market,
  //       currency: currency,
  //       locale: locale,
  //       originplace: origin,
  //       destinationplace: destination,
  //       outbounddate: outboundDate,
  //       inbounddate: inboundDate,
  //       locationschema: locationSchema,
  //       adults: passengers
  //     }
  //   }, (err, response, body) => {
  //     console.log(response)
  //   })