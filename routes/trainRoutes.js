const db = require('../db/connection');
const Promise = require('bluebird');
const phantom = require('phantom')
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const trains = require('../data/trains')

const generateTrainUrl = function (origin, destination, date) {
  console.log(origin, destination)
  return new Promise((resolve, reject) => {
    Promise.all([
      db.Airports.findOne({
      where: { FAA_IATA: origin },
      raw: true
    }),
      db.Airports.findOne({
        where: { FAA_IATA: destination },
        raw: true
      })
    ])
    .then(results => {
      let url = `https://www.wanderu.com/en/depart/${results[0].City}%2C%20`+
                 `${results[0].State}%2C%20USA/${results[1].City}%2C%20` +
                 `${results[1].State}%2C%20USA/${date}`
      resolve(url)
    })
  })
}

const getTrainCosts = async (function(req, res) {
  const { origin, destination, travelers, date, distance } = req.params
  const url = await (generateTrainUrl(origin, destination, date))
  const instance = await (phantom.create(['--load-images=no'], {
    phantomPath: '/usr/local/bin/phantomjs'
  }))
  const page = await (instance.createPage())
  const status = await (page.open(url));
  console.log('train data status ' + status)
  await (page.injectJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js'));
  let content;
  let attempts = 1;
  function getTraindata() {
    if (attempts > 5) {
      res.status(404).send();
    }
    return setTimeout(async (() => {
      let testPage = await (page.evaluate(function() {
        const testTime = $('span.booking-duration').html();
        return !!testTime;
      }))
      if (testPage) {
        content = await (page.evaluate(function() {
          const time = $('span.booking-duration').html();
          const times = time.split(' ');
          const numericTime = Number(times[0].slice(0, -1)) + Number(times[1].slice(0, -1)) / 60;
          results = {
            cost: Number($('span.price').html().slice(1)),
            timeText: time,
            time: numericTime,
            mode: 'train'
          }
          return results;
        }))
      } else {
        attempts++;
        return getTraindata();
      }
      content.emissions = trains.trainEmissions.perMile * distance * travelers;
      content.cost = content.cost * travelers;
      console.log('sending price data ' + content)
      res.status(200).send(content)
    }), 1000)
  }
  getTraindata();

})

module.exports = {
  getTrainCosts: getTrainCosts
}
