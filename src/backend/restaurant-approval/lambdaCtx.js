const restaurantApproval = require('./index').restaurantApproval;

exports.handler = async (event, context, callback) => {
    const { id, event: {op, data}, table } = JSON.parse(event.body);
    console.log(`processing event ${id}`);
    try {
        var result = await restaurantApproval(data.new);
        return callback(null, {
            statusCode: 200,
            body: result
        });
    } catch(e) {
        console.log(e);
        return callback(null, {
            statusCode: 500,
            body: e.toString()
        });
    }
};
