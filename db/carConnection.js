'use strict'
const mysql = require('mysql');
const Sequelize = require('sequelize');
const rp = require('request-promise')

const connection = new Sequelize('car_db', process.env.RDS_USERNAME, process.env.RDS_PASSWORD, {
  host: process.env.RDS_HOSTNAME,
  port: process.env.RDS_PORT
})

connection.sync()
.then(function(){
    console.log('car db connection successful');
}, function(err){
    console.log(err)
})

const cars = connection.define('cars', {
    id:{type: Sequelize.INTEGER,
        primaryKey: true,
    },
    EPM: Sequelize.DECIMAL(10,2),
    MPG: Sequelize.INTEGER,
    Make: Sequelize.STRING(50),
    Model: Sequelize.STRING(50),
    YEAR: Sequelize.STRING(4)
}, {timestamps:false});

cars.sync();

exports.cars = cars