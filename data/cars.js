//reported by EPA
//emissions are lbs/meter
const carEmissions = {
  small: 0.000497097,
  med: 0.000621371,
  large: 0.000745645
};

// lbs/mile
// let carEmissions = {
//   small: 0.8
//   med: 1.0
//   large: 1.2
// }

//reported by AAA
//cents per mile - includes gas and maintenance costs
const carCosts = {
  small: 12.39,
  med: 14.72,
  large: 18.12
};


module.exports = {
  carEmissions: carEmissions,
  carCosts: carCosts
};