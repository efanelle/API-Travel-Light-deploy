const distance = require('../helpers/distance');
const data = require('../data/cars');
const request = require('request');
const timeCalc = require('../helpers/time')

const getWalkingCosts = (req,res) => {
    console.log('got into get transit costs')
  let {driveOriginLat, driveOriginLng, driveDestLat, driveDestLng} = req.params;
  let api_key = process.env.GoogleMaps_API_KEY;
  let Origin = [Number(driveOriginLat),Number(driveOriginLng)];
  let Destination = [Number(driveDestLat),Number(driveDestLng)];
  const options = {
    url:`https://maps.googleapis.com/maps/api/directions/json?origin=${Origin}&destination=${Destination}&mode=walking&key=${api_key}`
  };
  request(options, (err, response, body) => {
    if (err) {
      console.log(err);
    }
    body = JSON.parse(body)

    let walkingTime = 0;
    let walkingCost = 0;
    let walkingEmission = 0 ;
    let walkingTimeText = '';
    console.log('walking body.routes ----------- --------- --------- ---------- --------')
    console.log(body)
    let routeStepArray =  body.routes[0].legs[0]
    walkingTime = Number(routeStepArray.duration.value)/3600;
    //do we want this to be in hours?
    walkingTimeText = routeStepArray.duration.text;
    walkingDistance = Number(routeStepArray.distance.value)/1609.34;
    //do we want this to be in miles?
    walkingEmission = (walkingDistance*.029)
    walkingCost = 0;


    const responseObj = {
        mode: 'walking',
        cost: walkingCost,
        emissions: walkingEmission,
        time: walkingTime,
        timeText: walkingTimeText
    } ;
    console.log('********the walking response is:')
    console.log(responseObj)
    console.log('*********end of walking response ***********')
    res.status(200).send(JSON.stringify(responseObj));
  });
}

module.exports = {
  getWalkingCosts: getWalkingCosts
}
