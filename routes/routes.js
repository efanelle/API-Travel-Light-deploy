'use strict'
const Promise = require('bluebird');
const distance = require('../helpers/distance');
const db = require('../db/connection');
const request = require('request');
const jStat = require('jStat').jStat
const cheerio = require('cheerio')



module.exports = function(app) {
  // Testing price crawler
  app.get('/test', (req, res) => {
    request('https://www.kayak.com/flights/ATL-BOS/2016-11-25', (err, response, body) => {
      const $ = cheerio.load(body)
      let bodyText = $('html > body').text()
      res.status(200).send(request)
    })
  })


  // Retreive all US airports


  app.get('/api/carTimeAndDistance', (req,res) => {
    let api_key = 'AIzaSyActkAY-HutxFQ7CS9-VJQUptb0M5IRl6k';
    let origin = [37.618972,-122.374889];//SFO
    let destination = [40.639751,-73.778925]; //JFK
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
      let distance = JSON.parse(body).rows[0].elements[0].distance.value/1609.34; //2940 Miles

      //parsing data for time output in seconds, converted to hours
      let carTime = JSON.parse(body).rows[0].elements[0].duration.value/3600;//1 day 19 hrs

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
        carTime: carTime//hours
      } ;

      res.status(200).send(JSON.stringify(responseObj));
    });
  });

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

  app.get('/api/planes', (req, res) => {
    // Should recieve origin airport, destination, with lat / lng, and date of travel

  // Calculate distance btwn 2 coordinates
  // ie. distance.caclulateDist([34, 84], [35, 85])

    // Get fligt price from skyscanner
    // Can give user a direct flights only option
    let market = 'US';
    let currency = 'USD';
    let locale = 'en-US';
    let origin = 'ATL';
    let destination = 'DEN';
    let outboundDate = '2016-12-10';
    let inboundDate = '2016-12-14';
    let locationSchema = 'Iata';
    let passengers = 1

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

    let options = {
      url: `http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/${market}/${currency}/${locale}/${origin}/${destination}/${outboundDate}/${inboundDate}?apiKey=${process.env.SKYSCANNER_API_KEY}`
    }
    request(options, (err, response, body) => {
      if (err) {
        console.log(err)
      }
      body = JSON.parse(body)
      if (body.Quotes.length === 0) {
        outboundDate = outboundDate.slice(0, -3);
        inboundDate = inboundDate.slice(0, -3);
        let options = {
          url: `http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/${market}/${currency}/${locale}/${origin}/${destination}/${outboundDate}/${inboundDate}?apiKey=${process.env.SKYSCANNER_API_KEY}`
        }
        request(options, (err, response, body) => {
          if (err) {
            console.log(err)
          }
          // Get array of prices
          let priceArray = body.Quotes
            .map(quote => quote.MinPrice);
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
          const priceObj = {
            low: filteredJStatPrices.min(),
            med: filteredJStatPrices.mean(),
            high: filteredJStatPrices.max()
          }
          res.status(200).send({price: priceObj.low, type: 'average'})
        })
      } else {
        let minPrice = body.Quotes[0].MinPrice
        console.log(minPrice)
        res.status(200).send(body)
        //res.status(200).send({price: minPrice, type: 'single day'})
      }
    })

  })

}

