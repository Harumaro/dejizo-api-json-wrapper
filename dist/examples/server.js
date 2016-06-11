var express = require('express');
var Dejizo = require('../lib/dejizo');
var app = express();
var path = require('path');

app.use('/web', express.static(__dirname + '/../../web'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.htm'));
});

app.get('/translate', function (req, res) {
  var word = req.query.word || '';
  var dictionary = req.query.dict || 'EdictJE';
  var page = req.query.page || 1;
  Dejizo.parse(word, {dict: dictionary, page: page}).then(function (match) {
    res.json(match);
  }).catch(function (err) {
    res.json({});
  });
});

app.listen(8080);
