const express = require('express');
const morgan = require('morgan');


const port = process.env.PORT || 1337;
const ip = process.env.IP || '127.0.0.1';
app = express();

app.use(morgan('dev'))
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
})
app.use(express.static('TLdist'))


// Routes
require('./routes/routes')(app)

app.listen(port, function() {
  console.log('The magic is on ' + ip + ':' + port);
});
