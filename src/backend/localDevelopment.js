const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

app.post('/validate-order', function (req, res) {
    console.log("Got a POST request for the homepage");
    res.json(req.body);
});

app.post('/payment', function (req, res) {
    console.log("Got a POST request for the homepage");
    res.json(req.body);
});

app.post('/restaurant-approval', function (req, res) {
    console.log("Got a POST request for the homepage");
    res.json(req.body);
});

app.post('/agent-assignment', function (req, res) {
    console.log("Got a POST request for the homepage");
    res.json(req.body);
});

var server = app.listen(8081, function () {
    console.log("server listening on port 8081");
});
