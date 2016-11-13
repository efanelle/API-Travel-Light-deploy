const express = require('express');
const morgan = require('morgan');
const mysql = require('mysql');

const port = process.env.PORT || 1337;
const ip = process.env.IP || '127.0.0.1';
app = express();


const connection = mysql.createConnection({
  host     : process.env.RDS_HOSTNAME,
  user     : process.env.RDS_USERNAME,
  password : process.env.RDS_PASSWORD,
  port     : process.env.RDS_PORT,
  database : 'AirportLocations'
});

//Testing DB connection
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);
});

connection.query(`select * from Airports where City = 'Atlanta'`, [], (err, results) => {
  console.log(err)
  console.log(results)
})

app.use(morgan('dev'))
app.use(express.static('TLdist'))

// Routes
require('./routes/routes')(app)

app.listen(port, function() {
  console.log('The magic is on ' + ip + ':' + port);
});
