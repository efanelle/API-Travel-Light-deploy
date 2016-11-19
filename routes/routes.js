'use strict'
const airports = require('./airportRoutes')
const averages = require('./averagesRoutes')
const cars = require('./carRoutes')
const planes = require('./planeRoutes')

module.exports = function(app) {

  //retrieving all US airports
  app.get('/api/airports', airports.getAllAirports)

<<<<<<< 2ada418db21eb0485c5a3084f656dedcc0845498
  app.get('/api/normalizers/:travelers/:originLat/:originLng/:destLat/:destLng',
  averages.getAveragesByTripLength)
  // Retreive car distance and location data
  app.get('/api/cars/:airOriginLat/:airOriginLng/:airDestLat/:airDestLng/:driveOriginLat/:driveOriginLng/:driveDestLat/:driveDestLng',
  cars.getCarCosts);
=======

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
  app.get('/api/cars/:originLat/:originLng/:destLat/:destLng', (req,res) => {
    let {originLat, originLng, destLat, destLng} = req.params;
    let api_key = 'AIzaSyActkAY-HutxFQ7CS9-VJQUptb0M5IRl6k';
    //example data
    // let origin = [37.618972,-122.374889];//SFO
<<<<<<< 0a0d2c2256b94f35ff9984a69023c2e385d2cea9
    let origin = [Number(originLat), Number(originLng)];
    let destination = [Number(destLat), Number(destLng)];
=======
    let origin = [40.71,-104.03];//Denver
    let destination = [33.74,-84.38]; //ATL
>>>>>>> add nothing of import
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
      const MetersPerMile = 1609.34;
      let distance = JSON.parse(body).rows[0].elements[0].distance.value/MetersPerMile; //2940 Miles

      //parsing data for time output in seconds, converted to hours
      const SecondsPerHour = 3600;
      let carTime = JSON.parse(body).rows[0].elements[0].duration.value/SecondsPerHour;//1 day 19 hrs
      let carTimeText = JSON.parse(body).rows[0].elements[0].duration.text;//1 day 19 hrs

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
        mode: 'car',
        cost: carCost,//Dollars
        emissions: carEmissions,//lbs of CO2
        time: carTime,//hours
        timeText: carTimeText
      } ;
>>>>>>> add nothing of import

  app.get('/api/planes/:origin/:destination/:date/:travelers/:originLat/:originLng/:destLat/:destLng',
  planes.getPlaneCosts)
}
