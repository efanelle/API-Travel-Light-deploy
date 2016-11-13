'use strict'
var Promise = require('bluebird');

Number.prototype.toRadians = function() {
  return this * Math.PI / 180;
}

module.exports = function(app) {
  app.get('/test', (req, res) => {
    res.status(200).send('working')
  })

  app.get('/api/planes', (req, res) => {
    // Should recieve origin airport, destination, with lat / lng, and date of travel

  // Calculate distance btwn 2 coordinates
    let R = 3959; // miles
    let φ1 = lat1.toRadians();
    let φ2 = lat2.toRadians();
    let Δφ = (lat2-lat1).toRadians();
    let Δλ = (lon2-lon1).toRadians();

    let a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    let distance = R * c;

    // Get fligt price from skyscanner
    // Can give user a direct flights only option

  })

}

