'use strict'
const airports = require('./airportRoutes')
const averages = require('./averagesRoutes')
const cars = require('./carRoutes')
const planes = require('./planeRoutes')
const transit = require('./transitRoutes')

module.exports = function(app) {

  //retrieving all US airports
  app.get('/api/airports', airports.getAllAirports)


  app.get('/api/normalizers/:travelers/:originLat/:originLng/:destLat/:destLng',
  averages.getAveragesByTripLength)
  // Retreive car distance and location data
  app.get('/api/cars/:airOriginLat/:airOriginLng/:airDestLat/:airDestLng/:driveOriginLat/:driveOriginLng/:driveDestLat/:driveDestLng',
  cars.getCarCosts);
  //Retrieve Transit costs
  app.get('/api/transit/:driveOriginLat/:driveOriginLng/:driveDestLat/:driveDestLng',transit.getTransitCosts)

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
 
  app.get('/api/planes/:origin/:destination/:date/:travelers/:originLat/:originLng/:destLat/:destLng',
  planes.getPlaneCosts)
}
