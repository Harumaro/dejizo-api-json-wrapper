var express = require('express');
var app = express();
var path = require('path');

app.use('/web', express.static(__dirname + '/../../web'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.htm'));
});

app.listen(8080);