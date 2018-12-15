var express = require('express');
var app = express();
var path = require('path');


app.use('/', express.static(__dirname + '/website/'));


app.get('/', function (req, res) {
  // res.send('Hello World!');
  res.sendFile(path.join(__dirname + '/website/main.html'));
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
