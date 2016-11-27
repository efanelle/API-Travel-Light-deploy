const db = require('../db/connection');
const Promise = require('bluebird');

const generateTrainUrl = function (origin, destination, travelers, date) {
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
      let url =
      console.log(results)
    })
  })
}
generateTrainUrl('ATL', 'PHL')

const getTrainCosts = (req, res) => {
  console.log(req.params)
  let { origin, destination, travelers, date, distance } = req.params
  generateTrainUrl(origin, destination, travelers, date)
  .then(url => console.log(url))
  res.status(200).send()
}

module.exports = {
  getTrainCosts: getTrainCosts
}
