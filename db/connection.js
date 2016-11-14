'use strict'
const mysql = require('mysql');
const Sequelize = require('sequelize');

// Connect to AWS RDS database
const connection = new Sequelize('AirportLocations', process.env.RDS_USERNAME, process.env.RDS_PASSWORD, {
  host: process.env.RDS_HOSTNAME,
  port: process.env.RDS_PORT
})
connection.sync()
.then(function(){
  console.log('connection successful');
},function(err){
  console.log(err);
});

// Sync with Airport locations table
const Airports = connection.define('Airports', {
  Airport:  {type: Sequelize.INTEGER,
              primaryKey: true,
              autoIncrement: true},
  Name:    Sequelize.STRING(70),
  City:    Sequelize.STRING(39),
  Country: Sequelize.STRING(32),
  FAA_IATA: Sequelize.STRING(9),
  ICAO:    Sequelize.STRING(9),
  Latitude: Sequelize.FLOAT(19,15),
  Longitude: Sequelize.FLOAT(19,15),
  Altitude: Sequelize.STRING(5),
  Timezone: Sequelize.STRING(17),
  DST:     Sequelize.STRING(15),
  TZ_db_Timezone: Sequelize.STRING(22)
}, {timestamps: false});

Airports.sync();

// Example query, raw: true will give just the needed results
/* Airports.findAll({
  where: {
    City: 'Atlanta'
  },
  raw: true
})
.then((results) => {console.log(results)}) */


exports.Airports = Airports