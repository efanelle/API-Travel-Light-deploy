const distance = require('../helpers/distance');
const data = require('../data/cars');
const request = require('request');
const timeCalc = require('../helpers/time')

const getTransitCosts = (req,res) => {
    console.log('got into get transit costs')
  let {driveOriginLat, driveOriginLng, driveDestLat, driveDestLng} = req.params;
  let api_key = process.env.GoogleMaps_API_KEY;
  let driveOrigin = [Number(driveOriginLat),Number(driveOriginLng)];
  let driveDestination = [Number(driveDestLat),Number(driveDestLng)];
  const options = {
    url:`https://maps.googleapis.com/maps/api/directions/json?origin=${driveOrigin}&destination=${driveDestination}&mode=transit&key=${api_key}`
  };
  request(options, (err, response, body) => {
    if (err) {
      console.log(err);
    }
    console.log('================================= YOU ARE IN THE TRANSIT REQUEST')
    body = JSON.parse(body)
    // //parsing data for distance output in meters, converted to miles
    // const MetersPerMile = 1609.34;
    // let distance = body.rows[0].elements[1].distance.value/MetersPerMile;
    // let carAirDistance = body.rows[0].elements[0].distance.value/MetersPerMile + body.rows[1].elements[1].distance.value/MetersPerMile;
    // //parsing data for time output in seconds, converted to hours
    // const SecondsPerHour = 3600;
    // let carTime = body.rows[0].elements[1].duration.value / SecondsPerHour;
    // let carTimeText = body.rows[0].elements[1].duration.text;
    // let carAirTime = body.rows[0].elements[0].duration.value / SecondsPerHour + body.rows[1].elements[1].duration.value/SecondsPerHour;
    // let carAirTimeText = timeCalc(carAirTime);
    // // using static data for emissions
    // const carEmissions = ((data.carEmissions.small + data.carEmissions.med + data.carEmissions.large) / 3)*distance;
    // const carAirEmissions = ((data.carEmissions.small + data.carEmissions.med + data.carEmissions.large) / 3)*carAirDistance;
    // // using static data for cost per mile
    // const costPerMile = (data.carCosts.small + data.carCosts.med + data.carCosts.large)/3;
    // const carCost = distance * costPerMile;
    // const carAirCost = carAirDistance * costPerMile
    let transitTime = 0;
    let transitCost = 0;
    let transitEmission = 0 ;
    let transitTimeText = '';


    let routeStepArray =  body.routes[0].legs[0]
    transitTime = Number(routeStepArray.duration.value)/3600;
    transitTimeText = routeStepArray.duration.text; 
    transitDistance = Number(routeStepArray.distance.value)/1609.34;
    transitEmission = (transitDistance*140)/453.592
    transitCost = (transitDistance * 84)/100;
  

    const responseObj = {
        tmode: 'transit',
        tCost: transitCost,
        tEmission: transitEmission,
        tTime: transitTime,
        tTimeText: transitTimeText
    } ;
    console.log('********the transit response is:')
    console.log(responseObj)
    console.log('*********end of transit response ***********')
    // console.log('the transit object is', responseObject)
    res.status(200).send(JSON.stringify(responseObj));
  });
}

module.exports = {
  getTransitCosts: getTransitCosts
}
