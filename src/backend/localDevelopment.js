const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const validateOrder = require('validate-order').validateOrder;
const makePayment = require('payment').makePayment;
const restaurantApproval = require('restaurant-approval').restaurantApproval;
const assignAgent = require('agent-assignment').assignAgent;

app.use(bodyParser.json());

app.post('/validate-order', async function (req, res) {
    try{
        var result = await validateOrder(req.body);
        res.json(result);
    } catch(e) {
        console.log(e);
        res.status(500).json(e.toString());
    }
});

app.post('/payment', async function (req, res) {
    try {
        var result = await makePayment(req.body);
        res.json(result);
    } catch(e) {
        console.log(e);
        res.status(500).json(e.toString());
    }
});

app.post('/restaurant-approval', async function (req, res) {
    try {
        var result = await restaurantApproval(req.body);
        res.json(result);
    } catch(e) {
        console.log(e);
        res.status(500).json(e.toString());
    }
});

app.post('/agent-assignment', async function (req, res) {
    try {
        var result = await assignAgent(req.body);
        res.json(result);
    } catch(e) {
        console.log(e);
        res.status(500).json(e.toString());
    }
});

var server = app.listen(8081, function () {
    console.log("server listening on port 8081");
});
