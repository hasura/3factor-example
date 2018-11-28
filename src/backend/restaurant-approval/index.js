const Sequelize = require("sequelize");

const POSTGRES_CONNECTION_STRING = process.env.POSTGRES_CONNECTION_STRING || "postgres://postgres:password@localhost:6432/postgres";

const sequelize = new Sequelize(
    POSTGRES_CONNECTION_STRING, {}
);

async function restaurantApproval(order) {
    try {
        var res = await sequelize.query('UPDATE orders SET approved = true WHERE order_id = :orderId',
                                    { replacements: { orderId: order.order_id } }
                                       );
        return res;
    } catch(e) {
        console.log(e);
        throw new Error(e);
    }
}

exports.restaurantApproval = restaurantApproval;
