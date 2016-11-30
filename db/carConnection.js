'use strict'
const mysql = require('mysql');
const Sequelize = require('sequelize');
const rp = require('request-promise')

const carConnection = new Sequelize('car_db', process.env.RDS_USERNAME, process.env.RDS_PASSWORD, {
  host: process.env.RDS_HOSTNAME,
  port: process.env.RDS_PORT
})

carConnection.sync()
.then(function(){
    console.log('car db connection successful');
}, function(err){
    console.log(err)
})

const cars = carConnection.define('cars', 
    {
        id:{
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        EPM: Sequelize.DECIMAL(10,2),
        MPG: Sequelize.INTEGER,
        Make: Sequelize.STRING(50),
        CarModel: Sequelize.STRING(50),
        YEAR: Sequelize.STRING(4)
    }, 
    {timestamps:false}
);

cars.sync();

exports.cars = cars