const distance = require('../helpers/distance');
const normalizers = require('../data/averages')

const getAveragesByTripLength = (req, res) => {
  let {travelers, originLat, originLng, destLat, destLng, tripType} = req.params;
  let origin = [Number(originLat), Number(originLng)];
  let destination = [Number(destLat), Number(destLng)];
  let dist = distance.calculateDist(origin, destination)
  if (tripType === 'distant') {
    const averageObj = {
      distance: dist,
      time: normalizers.distant.timeCalc(dist) * dist,
      cost: normalizers.distant.costCalc(dist, Number(travelers)) * dist,
      emissions: normalizers.distant.emissions * dist
    }
    res.status(200).send(averageObj)
  } else {
    const averageObj = {
      distance: dist,
      time: normalizers.local.time * dist,
      cost: normalizers.local.costCalc(Number(travelers)) * dist,
      emissions: normalizers.local.emissions * dist
    }
    console.log('should have something here.... ' + averageObj)
    res.status(200).send(averageObj)
  }
}

module.exports = {
  getAveragesByTripLength: getAveragesByTripLength
}
