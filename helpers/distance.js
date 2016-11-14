'use strict'

Number.prototype.toRadians = function() {
  return this * Math.PI / 180;
}

exports.caclulateDist = function (coor1, coor2) {
  let [lat1, lon1] = coor1;
  let [lat2, lon2] = coor2;
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
  return distance
}

