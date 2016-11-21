const db = require('../db/connection');

const getAllAirports = (req, res) => {
  db.Airports.findAll({
    where: {
      Country: 'United States'
    },
    raw: true
  })
  .then((airports) => {
    res.status(200).send(airports)
  })
}

module.exports = {
  getAllAirports: getAllAirports
}
