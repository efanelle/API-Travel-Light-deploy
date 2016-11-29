// Average for cars and planes, for comparison purposes
exports.distant = {
  costCalc: (dist, travelers = 1) => .15 / 2 + (50 + .15 * dist) * travelers / dist / 2,
  emissions: 1.63/2,
  timeCalc: (dist) => (1.5 / 2 + (30 + 60 * dist / 528) / dist / 2) / 60
}
// time is in hours per mile
exports.local = {
  costCalc: (travelers) => (.204 * travelers + .14) / 3,
  emissions: 1.34 / 3,
  time: (1 / 3.1 + 1 / 25 + 1 / 10) / 3
}
