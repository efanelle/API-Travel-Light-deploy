'use strict'
const airports = require('./airportRoutes');
const averages = require('./averagesRoutes');
const cars = require('./carRoutes');
const planes = require('./planeRoutes');
const transit = require('./transitRoutes');
const trains = require('./trainRoutes');
const walking = require('./walkingRoutes');
const carList = require('./carModelRoutes')

module.exports = function(app) {

  //retrieving all US airports
  app.get('/api/airports', airports.getAllAirports)

  //Retrieving car information
  app.get('/api/carModels', carList.getAllCars)

  // Averages for data display purposes
  app.get('/api/normalizers/:travelers/:originLat/:originLng/:destLat/:destLng/:tripType', averages.getAveragesByTripLength)

  // Retreive car distance and location data
  app.get('/api/cars/:airOriginLat/:airOriginLng/:airDestLat/:airDestLng/:driveOriginLat/:driveOriginLng/:driveDestLat/:driveDestLng', cars.getCarCosts);

  //Retrieve Transit costs
  app.get('/api/transit/:driveOriginLat/:driveOriginLng/:driveDestLat/:driveDestLng/:travelers', transit.getTransitCosts)

  //Retrieve Walking costs
  app.get('/api/walking/:driveOriginLat/:driveOriginLng/:driveDestLat/:driveDestLng', walking.getWalkingCosts)

  // Retreive car distance and location data
  app.get('/api/planes/:origin/:destination/:date/:travelers/:originLat/:originLng/:destLat/:destLng',
  planes.getPlaneCosts)

  // Retreive train time and cost
  app.get('/api/trains/:origin/:destination/:travelers/:date/:distance', trains.getTrainCosts)
}
