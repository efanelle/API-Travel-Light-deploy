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

  app.get('/api/normalizers/:travelers/:originLat/:originLng/:destLat/:destLng', (req, res) => {
    let {travelers, originLat, originLng, destLat, destLng} = req.params;
    let origin = [Number(originLat), Number(originLng)];
    let destination = [Number(destLat), Number(destLng)];
    let dist = distance.calculateDist(origin, destination)
    const averageObj = {
      distance: dist,
      time: normalizers.timeCalc(dist) * dist,
      cost: normalizers.costCalc(dist, Number(travelers)) * dist,
      emissions: normalizers.emissions * dist
    }
    res.status(200).send(averageObj)
  })
  // Retreive car distance and location data
  app.get('/api/cars/:airOriginLat/:airOriginLng/:airDestLat/:airDestLng/:driveOriginLat/:driveOriginLng/:driveDestLat/:driveDestLng', (req,res) => {
    let {airOriginLat, airOriginLng, airDestLat, airDestLng, driveOriginLat, driveOriginLng, driveDestLat, driveDestLng} = req.params;
    let api_key = 'AIzaSyActkAY-HutxFQ7CS9-VJQUptb0M5IRl6k';
    //example data
    // TODO need to fix this.............
    let airOrigin = [Number(airOriginLat), Number(airOriginLng)];
    let airDestination = [Number(airDestLat), Number(airDestLng)];
    let driveOrigin = [Number(driveOriginLat), Number(driveOriginLng)];
    let driveDestination = [Number(driveDestLat), Number(driveDestLng)];
    console.log(airDestination)
    const options = {
      url:`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${driveOrigin}|${airDestination}&destinations=${airOrigin}|${driveDestination}&key=${api_key}`
    };
    request(options, (err, response, body) => {
      if (err) {
        console.log(err);
      }
      console.log(body)
      body = JSON.parse(body)
      //parsing data for distance output in meters, converted to miles
      const MetersPerMile = 1609.34;
      let distance = body.rows[0].elements[1].distance.value/MetersPerMile; //2940 Miles
      let carAirDistance = body.rows[0].elements[0].distance.value/MetersPerMile + body.rows[1].elements[1].distance.value/MetersPerMile;
      console.log('distance to and from airport ' + carAirDistance)
      //parsing data for time output in seconds, converted to hours
      const SecondsPerHour = 3600;
      let carTime = body.rows[0].elements[1].duration.value/SecondsPerHour;//1 day 19 hrs
      let carTimeText = body.rows[0].elements[1].duration.text;//1 day 19 hrs
      let carAirTime = body.rows[0].elements[0].duration.value/SecondsPerHour + body.rows[1].elements[1].duration.value/SecondsPerHour;
      let carAirTimeText = timeCalc(carAirTime);
      console.log('time to and from airport ' + carAirTimeText + ' ' + carAirTime)

      let emissionPerMileSml = .8;
      let emissionPerMileMed = 1.0;
      let emissionPerMileLrg = 1.2;  //1.2 for light truck/SUV

      const carEmissions = ((emissionPerMileSml+emissionPerMileMed+ emissionPerMileLrg) / 3)*distance;
      const carAirEmissions = ((emissionPerMileSml+emissionPerMileMed+ emissionPerMileLrg) / 3)*carAirDistance;
      console.log('emissions to and from airport ' + carAirEmissions)

      let costPerMileSml = .1239;
      let costPerMileMed = .1472;
      let costPerMileLrg = .1812;

      const costPerMile = (costPerMileSml+costPerMileMed+costPerMileLrg)/3;
      const carCost = distance*costPerMile;
      const carAirCost = carAirDistance * costPerMile
      console.log('driving cost to and fro airport ' + carAirCost)

      const responseObj = {
        car: {
          mode: 'car',
          cost: carCost,//Dollars
          emissions: carEmissions,//lbs of CO2
          time: carTime,//hours
          timeText: carTimeText
        },
        carToAir: {
          mode: 'car',
          cost: carAirCost,
          emissions: carAirEmissions,
          time: carAirTime,
          timeText: carAirTimeText
        }
      } ;
      console.log(responseObj)
      res.status(200).send(JSON.stringify(responseObj));
    });
  });


  app.get('/api/planes/:origin/:destination/:date/:travelers/:originLat/:originLng/:destLat/:destLng', (req, res) => {
    let {origin, destination, date, travelers, originLat, originLng, destLat, destLng} = req.params
    let market = 'US';
    let currency = 'USD';
    let locale = 'en-US';
    let outboundDate = date;
    let locationSchema = 'Iata';
    let year = outboundDate.slice(0, 4);
    let month = outboundDate.slice(5, 7);
    let day = outboundDate.slice(8, 10);
    let pointA = [Number(originLat), Number(originLng)]
    let pointB = [Number(destLat), Number(destLng)]
    let planeDist = distance.calculateDist(pointA, pointB); //DEN to ATL


    let planeStats = {
      emissions: Math.round(planeDist * planeInfo.planeEmissions.perMile*100)/100
      //lbs of CO2
    }

    // url for flight time
    let url = `https://api.flightstats.com/flex/schedules/rest/v1/json/from/${origin}/to/${destination}/departing/${year}/${month}/${day}?appId=${process.env.FLIGHTSTATS_API_ID}&appKey=${process.env.FLIGHTSTATS_API_KEY}`;
    console.log('flight stats url ' + url)
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
                resolve({mode: 'plane', time: avgTime, timeText: timeCalc(avgTime)})
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
              resolve({cost: minPrice * travelers, type: 'average', emissions: planeStats.emissions * travelers})
            })
          } else {
            let minPrice = body.Quotes[0].MinPrice
            resolve({cost: minPrice * travelers, type: 'single day', emissions: planeStats.emissions * travelers})
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
