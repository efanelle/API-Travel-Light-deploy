const express = require('express');

const port = process.env.PORT || 49151;

const ip = process.env.IP || '127.0.0.1';
app = express();

app.use(express.static('TLdist'))

app.listen(port, ip, function() {
  console.log('The magic is on ' + ip + ':' + port);
});
