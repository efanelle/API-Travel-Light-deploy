'use strict'
const airports = require('./airportRoutes')
const averages = require('./averagesRoutes')
const cars = require('./carRoutes')
const planes = require('./planeRoutes')

module.exports = function(app) {

  //retrieving all US airports
  app.get('/api/airports', airports.getAllAirports)

  app.get('/api/normalizers/:travelers/:originLat/:originLng/:destLat/:destLng',
  averages.getAveragesByTripLength)
  // Retreive car distance and location data
  app.get('/api/cars/:airOriginLat/:airOriginLng/:airDestLat/:airDestLng/:driveOriginLat/:driveOriginLng/:driveDestLat/:driveDestLng',
  cars.getCarCosts);

  app.get('/api/planes/:origin/:destination/:date/:travelers/:originLat/:originLng/:destLat/:destLng',
  planes.getPlaneCosts)
}
