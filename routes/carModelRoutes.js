const db = require('../db/carConnection');

const getAllCars = (req, res) => {
  db.cars.findAll({raw:true})
  .then((cars) => {
      res.status(200).send(cars)
  })
}

module.exports = {
    getAllCars:getAllCars
}