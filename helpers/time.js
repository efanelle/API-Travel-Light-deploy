'use strict'

module.exports = function (time){
  var minutes = time * 60
  var hour = 0, min, day, duration;
  while(minutes > 60) {
    minutes -= 60;
    hour+=1;
    min = Math.round(minutes);
    if(hour = 24){
      day += 1
      hour = 0
    }
  }
  if (day >= 1) {
    duration = day + ' day(s), ' + hour + ' hour(s), ' + min + ' min'
  } else if (hour > 1) {
    duration = hour + ' hours, ' + min + ' min';
  } else if( hour === 1) {
    duration = hour + ' hour, ' + min + ' min';
  } else {
    min = Math.round(minutes);
    duration = min + ' min';
  }
  return duration;
}
