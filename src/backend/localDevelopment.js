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
        var order;
        if(req.body.event) {
            order = req.body.event.data.new;
        } else {
            order = req.body;
        }
        var result = await validateOrder(order);
        res.json(result);
    } catch(e) {
        console.log(e);
        res.status(500).json(e.toString());
    }
});

app.post('/payment', async function (req, res) {
    try {
        var paymentReq = req.body;
        var result = await makePayment(paymentReq);
        res.json(result);
    } catch(e) {
        console.log(e);
        res.status(500).json(e.toString());
    }
});

app.post('/restaurant-approval', async function (req, res) {
    try {
        var order;
        if(req.body.event) {
            order = req.body.event.data.new;
        } else {
            order = req.body;
        }
        var result = await restaurantApproval(order);
        res.json(result);
    } catch(e) {
        console.log(e);
        res.status(500).json(e.toString());
    }
});

app.post('/agent-assignment', async function (req, res) {
    try {
        var order;
        if(req.body.event) {
            order = req.body.event.data.new;
        } else {
            order = req.body;
        }
        var result = await assignAgent(order);
        res.json(result);
    } catch(e) {
        console.log(e);
        res.status(500).json(e.toString());
    }
});

var server = app.listen(8081, function () {
    console.log("server listening on port 8081");
});
