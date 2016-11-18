// Average for cars and planes, for comparison purposes
module.exports = {
  costCalc: (dist) => .15 / 2 + (50 + .15 * dist) / dist / 2,
  emissions: 1.63/2,
  timeCalc: (dist) => (1.5 / 2 + (30 + 60 * dist / 528) / dist / 2) / 60
}
