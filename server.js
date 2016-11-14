const express = require('express');
const morgan = require('morgan');


const port = process.env.PORT || 1337;
const ip = process.env.IP || '127.0.0.1';
app = express();
console.log(process.env.RDS_HOSTNAME);
console.log(process.env.RDS_USERNAME);
console.log(process.env.RDS_PASSWORD);
console.log(process.env.RDS_PORT);

app.use(morgan('dev'))
app.use(express.static('TLdist'))

// Routes
require('./routes/routes')(app)

app.listen(port, function() {
  console.log('The magic is on ' + ip + ':' + port);
});
