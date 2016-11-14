'use strict'
const Promise = require('bluebird');
const distance = require('../helpers/distance');
const db = require('../db/connection');
const request = require('request');
const jStat = require('jStat').jStat



module.exports = function(app) {
  // Retreive all US airports
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
    let destination = 'SFO';
    let outboundDate = '2016-12-07';
    let inboundDate = '2016-12-10';
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

    const options = {
      url: `http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/${market}/${currency}/${locale}/${origin}/${destination}/${outboundDate}/${inboundDate}?apiKey=${process.env.SKYSCANNER_API_KEY}`
    }
    request(options, (err, response, body) => {
      if (err) {
        console.log(err)
      }
      // Get array of prices
      let priceArray = JSON.parse(body).Quotes
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
      res.status(200).send(body)
    })

  })

}

