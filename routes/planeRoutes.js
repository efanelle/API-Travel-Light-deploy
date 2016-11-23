const db = require('../db/connection');
const distance = require('../helpers/distance');
const planeInfo = require('../data/planes');
const rp = require('request-promise');
const jStat = require('jStat').jStat;
const timeCalc = require('../helpers/time')

const getPlaneCosts = (req, res) => {
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
  // url for flight price
  let options = {
    url: `http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/${market}/${currency}/${locale}/${origin}/${destination}/${outboundDate}/?apiKey=${process.env.SKYSCANNER_API_KEY}`
  }
  var arrivalTZAdjust;
  var departureTZAdjust;
  const p1 = rp(url)
    .then(body => {
      return new Promise((resolve, reject) => {
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
            console.log('*-*-*-*-*-*-*-*-*-*-*-**--*-*-*-*-*-*-*-*-*-*  Body.scheduledFlights at Planes')
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
      return new Promise((resolve, reject) => {
        body = JSON.parse(body)
        console.log(body)
        // If no pricing data for particular day, search the full month
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
            console.log(body)
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
}

module.exports = {
  getPlaneCosts: getPlaneCosts
}
