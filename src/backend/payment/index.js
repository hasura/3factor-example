const Sequelize = require("sequelize");

const POSTGRES_CONNECTION_STRING = process.env.POSTGRES_CONNECTION_STRING || "postgres://postgres:password@localhost:6432/postgres";

const sequelize = new Sequelize(
    POSTGRES_CONNECTION_STRING, {}
);

async function makePayment(paymentReq) {
    try {
        var res = await sequelize.query('BEGIN;' +
                                    'INSERT INTO payments(order_id, amount, type) values (:orderId, :amount, :type); ' +
                                    'UPDATE orders SET payment_valid=true WHERE order_id = :orderId; ' +
                                    'COMMIT;',
                                        { replacements: { orderId: paymentReq.order_id, amount: paymentReq.amount, type: paymentReq.type } }
                                   );
    } catch(e) {
        console.log(e);
        throw new Error(e);
    }
}

const testPayment = {
    "order_id": "adsfadfa1231231",
    "amount": 100,
    "type": "credit_card"
};

makePayment(testPayment);



