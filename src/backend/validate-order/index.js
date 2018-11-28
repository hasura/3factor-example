const Sequelize = require("sequelize");

const POSTGRES_CONNECTION_STRING = process.env.POSTGRES_CONNECTION_STRING || "postgres://postgres:password@localhost:6432/postgres";

const sequelize = new Sequelize(
    POSTGRES_CONNECTION_STRING, {}
);

function performValidation(order){
    return true;
}

async function validateOrder(order) {
    try {
        var isValid = performValidation(order);
        var res = await sequelize.query('UPDATE orders SET order_valid = :isValid WHERE order_id = :orderId',
                                    { replacements: { isValid: isValid, orderId: order.order_id } }
                                       );
        return res;
    } catch(e) {
        console.log(e);
        throw new Error(e);
    }
}

const testOrder = {
    "order_id": "adsfadfa1231231"
};

validateOrder(testOrder);
