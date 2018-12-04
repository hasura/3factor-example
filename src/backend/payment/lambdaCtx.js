const makePayment = require('./index').makePayment;

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
};

exports.handler = async (event, context, callback) => {
    if (event.httpMethod == "OPTIONS") {
        return callback(null, {
            statusCode: 204,
            body: "",
            headers
        });
    }
    var paymentReq = JSON.parse(event.body);
    try {
        var result = await makePayment(paymentReq);
        return callback(null, {
            statusCode: 200,
            body: JSON.stringify(result),
            headers
        });
    } catch(e) {
        console.log(e);
        return callback(null, {
            statusCode: 500,
            body: e.toString(),
            headers
        });
    }
};
