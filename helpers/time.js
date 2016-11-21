'use strict'

module.exports = function (time){
  var minutes = time * 60
  var hour = 0, min, duration;
  while(minutes > 60) {
    minutes -= 60;
    hour+=1;
    min = Math.round(minutes);
  }
  if (hour > 1) {
    duration = hour + ' hours, ' + min + ' min';
  } else if( hour === 1) {
    duration = hour + ' hour, ' + min + ' min';
  } else {
    min = Math.round(minutes);
    duration = min + ' min';
  }
  return duration;
}
