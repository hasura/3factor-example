import React from 'react';
// import {Table, Button} from 'react-bootstrap';

import {Link} from "react-router-dom";
import gql from "graphql-tag";
import {Mutation, Subscription} from "react-apollo";
import getStatus from './GetStatus';

const GET_ORDERS = gql`
  subscription fetch_orders($user: String!) {
    orders(where: {user_id: {_eq: $user}}, order_by: { created: asc}) {
      order_id
      order_valid
      payment_valid
      approved
      driver_assigned
      created
    }
  }
`;

const PAY_ALL = gql`
  mutation payAll($userid: String!) {
    update_orders(_set: {payment_valid: true, placed: true}, where: {
      user_id: {_eq: $userid},
      _or: [
        {payment_valid: {_is_null: true}},
        {placed: {_eq: false}}
      ]}) {
      affected_rows
    }
  }
`;


const Orders = ({username}) => (
  <div>
    <h2>Your orders </h2>
    <hr/>
    <Mutation mutation={PAY_ALL}>
      {(payAll, {loading, error, data}) => {
        if (loading) {
          return (<span><button className="btn btn-warning" disabled>Loading...</button>&nbsp;&nbsp;</span>);
        }
        if (error) {
          return (<span><button className="btn btn-warning" >Try again: {error.toString()}</button>&nbsp;&nbsp;</span>);
        }
        return (
          <span>
            <button
              className="btn btn-warning"
              onClick={(e) => {
                payAll({
                  variables: {
                    userid: username
                  }})
              }}>
              {data ? (data.update_orders.affected_rows + ' paid!') : 'Pay all'}
            </button>&nbsp;&nbsp;
          </span>
        );
      }}
    </Mutation>
    <hr/>
    <Subscription
      subscription={GET_ORDERS} variables={{user: username}}>
      {({loading, error, data}) => {
        if (loading) return "Loading...";
        if (error) return `Error!: ${error}`;
        if (data.orders.length === 0) {
          return "No orders yet."
        } else {
          const orders = data.orders.map((o, i) => (
            <tr key={i}>
              <td>
                {
                  (new Date(o.created)).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                }
              </td>
              <td>
                <Link to={'/order/'+o.order_id}>{o.order_id}</Link>
              </td>
              <td>
                {getStatus(o)}
              </td>
            </tr>));
          return (
            <table className="striped hover bordered responsive">
              <thead>
                <tr><th>Created</th><th>Order ID</th><th>Status</th></tr>
              </thead>
              <tbody>
                {orders}
              </tbody>
            </table>
          );
        }
      }}
    </Subscription>
    <hr/>
  </div>
);
export default Orders;
