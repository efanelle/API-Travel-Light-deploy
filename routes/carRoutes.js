const distance = require('../helpers/distance');
const data = require('../data/cars');
const request = require('request');
const timeCalc = require('../helpers/time')

const getCarCosts = (req,res) => {
  let {airOriginLat, airOriginLng, airDestLat, airDestLng, driveOriginLat, driveOriginLng, driveDestLat, driveDestLng} = req.params;

  let api_key = process.env.GoogleMaps_API_KEY;
  //if we got planes
  if (airOriginLat !== 'undefined') {
    let airOrigin = [Number(airOriginLat), Number(airOriginLng)];
    let airDestination = [Number(airDestLat), Number(airDestLng)];
    let driveOrigin = [Number(driveOriginLat), Number(driveOriginLng)];
    let driveDestination = [Number(driveDestLat), Number(driveDestLng)];
    const options = {
      url:`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${driveOrigin}|${airDestination}&destinations=${airOrigin}|${driveDestination}&key=${api_key}`
    };
    request(options, (err, response, body) => {
      if (err) {
        console.log(err);
      }
      body = JSON.parse(body)
      //parsing data for distance output in meters, converted to miles
      const MetersPerMile = 1609.34;
      let distance = body.rows[0].elements[1].distance.value/MetersPerMile;
      let carAirDistance = body.rows[0].elements[0].distance.value/MetersPerMile + body.rows[1].elements[1].distance.value/MetersPerMile;
      //parsing data for time output in seconds, converted to hours
      const SecondsPerHour = 3600;
      let carTime = body.rows[0].elements[1].duration.value / SecondsPerHour;
      let carTimeText = body.rows[0].elements[1].duration.text;
      let carAirTime = body.rows[0].elements[0].duration.value / SecondsPerHour + body.rows[1].elements[1].duration.value/SecondsPerHour;
      let carAirTimeText = timeCalc(carAirTime);
      // using static data for emissions
      const carEmissions = ((data.carEmissions.small + data.carEmissions.med + data.carEmissions.large) / 3)*distance;
      const carAirEmissions = ((data.carEmissions.small + data.carEmissions.med + data.carEmissions.large) / 3)*carAirDistance;
      // using static data for cost per mile
      const costPerMile = (data.carCosts.small + data.carCosts.med + data.carCosts.large)/3;
      const carCost = distance * costPerMile;
      const carAirCost = carAirDistance * costPerMile

      const responseObj = {
        tripInfo: {
          destination: body.destination_addresses[1].split(',')[1],
          origin: body.origin_addresses[0].split(',')[1]
        },
        car: {
          mode: 'car',
          cost: carCost,//Dollars
          emissions: carEmissions,//lbs of CO2
          time: carTime,//hours
          timeText: carTimeText
        },
        carToAir: {
          mode: 'car',
          cost: carAirCost,
          emissions: carAirEmissions,
          time: carAirTime,
          timeText: carAirTimeText
        }
      } ;
      console.log(responseObj)
      res.status(200).send(JSON.stringify(responseObj));
    });
    //if we didnt get planes
  } else {
    let driveOrigin = [Number(driveOriginLat), Number(driveOriginLng)];
    let driveDestination = [Number(driveDestLat), Number(driveDestLng)];
    const options = {
      url:`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${driveOrigin}&destinations=${driveDestination}&key=${api_key}`
    };
    request(options, (err, response, body) => {
      if (err) {
        console.log(err);
      }
      body = JSON.parse(body)
      const MetersPerMile = 1609.34;
      let distance = body.rows[0].elements[0].distance.value/MetersPerMile;
      //parsing data for time output in seconds, converted to hours
      const SecondsPerHour = 3600;
      let carTime = body.rows[0].elements[0].duration.value / SecondsPerHour;
      let carTimeText = body.rows[0].elements[0].duration.text;
      // using static data for emissions
      const carEmissions = ((data.carEmissions.small + data.carEmissions.med + data.carEmissions.large) / 3)*distance;
      // using static data for cost per mile
      const costPerMile = (data.carCosts.small + data.carCosts.med + data.carCosts.large)/3;
      const carCost = distance * costPerMile;

  let api_key = process.env.GoogleMaps_API_KEY;
  let driveOrigin = [Number(driveOriginLat), Number(driveOriginLng)];
  let driveDestination = [Number(driveDestLat), Number(driveDestLng)];
  const options = {
    url:`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${driveOrigin}&destinations=${driveDestination}&key=${api_key}`
  };
  request(options, (err, response, body) => {
    if (err) {
      console.log(err);
    }
    body = JSON.parse(body)
    //parsing data for distance output in meters, converted to miles
    const MetersPerMile = 1609.34;
    let distance = body.rows[0].elements[0].distance.value/MetersPerMile;
    //parsing data for time output in seconds, converted to hours
    const SecondsPerHour = 3600;
    let carTime = body.rows[0].elements[0].duration.value / SecondsPerHour;
    let carTimeText = body.rows[0].elements[0].duration.text;
    // using static data for emissions
    const carEmissions = ((data.carEmissions.small + data.carEmissions.med + data.carEmissions.large) / 3)*distance;
    // using static data for cost per mile
    const costPerMile = (data.carCosts.small + data.carCosts.med + data.carCosts.large)/3;
    const carCost = distance * costPerMile;

      const responseObj = {
        tripInfo: {
          destination: body.destination_addresses[0].split(',')[1],
          origin: body.origin_addresses[0].split(',')[1]
        },
        car: {
          mode: 'car',
          cost: carCost,//Dollars
          emissions: carEmissions,//lbs of CO2
          time: carTime,//hours
          timeText: carTimeText
        }
      }
      res.status(200).send(JSON.stringify(responseObj));
    })
  })
}
}

module.exports = {
  getCarCosts: getCarCosts
}
