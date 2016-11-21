const distance = require('../helpers/distance');
const normalizers = require('../data/averages')

const getAveragesByTripLength = (req, res) => {
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
}

module.exports = {
  getAveragesByTripLength: getAveragesByTripLength
}
