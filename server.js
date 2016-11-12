const express = require('express');
const morgan = require('morgan');
const mysql = require('mysql');

const port = process.env.PORT || 49151;
const ip = process.env.IP || '127.0.0.1';
app = express();


const connection = mysql.createConnection({
  host     : process.env.RDS_HOSTNAME,
  user     : process.env.RDS_USERNAME,
  password : process.env.RDS_PASSWORD,
  port     : process.env.RDS_PORT
});

//Testing DB connection
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId + ' to ' + process.enc.RDS_HOSTNAME);
});

app.use(morgan('dev'))
app.use(express.static('TLdist'))

app.listen(port, function() {
  console.log('The magic is on ' + ip + ':' + port);
});
