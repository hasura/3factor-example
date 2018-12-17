import React from 'react';
// import {Table, Button, Grid} from 'react-bootstrap';

import {Link} from "react-router-dom";
import gql from "graphql-tag";
import {Subscription} from "react-apollo";
import getStatus from './GetStatus';

const PAYMENT_URL = process.env.REACT_APP_PAYMENT_URL || 'http://localhost:8081/payment';

const GET_ORDERS = gql`
  subscription fetch_orders($user: String!, $order_id: String! ) {
    orders(where: {user_id: {_eq: $user}, order_id: {_eq: $order_id}}, order_by: { created: asc}) {
      order_id
      order_valid
      payment_valid
      approved
      driver_assigned
      created
    }
  }
`;

const OrderStatus = ({username, orderId}) => {
  return (
    <div>
      <div className="container">
        <div>
          <hr/>
          <Subscription
            subscription={GET_ORDERS} variables={{user: username, order_id: orderId}}>
            {({loading, error, data}) => {
              if (loading) return "Loading...";
              if (error) return `Error!: ${JSON.stringify(error, null, 2)}`;
              console.log(data);
              if (data.orders.length === 0) {
                return "No such order id."
              } else {
                const o = data.orders[0];
                return (
                  <div>
                    <table className="striped hover bordered responsive">
                      <tbody>
                        <tr>
                          <td>Created: </td>
                          <td>
                            {
                              (new Date(o.created)).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                            }
                          </td>
                        </tr>
                        <tr>
                          <td>
                            Id:
                          </td>
                          <td>
                            <Link to={'/'}>{o.order_id}</Link>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            Status:
                          </td>
                          <td>
                            {getStatus(o)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <MakePayment order={o} username={username} />
                  </div>
                );
              }
            }}
          </Subscription>
          <hr/>
          <Link to="/"><button className="btn btn-danger">Back</button></Link>
        </div>
      </div>
      <div className="footerWrapper">
        <a href={'https://github.com/hasura/3factor-example'} target={'_blank'}>Source</a>
      </div>
    </div>
  );
};

class MakePayment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      paymentDone: false,
      loading: null,
      error: null,
      order: props.order,
      username: props.username
    };
    this.onClick = this.onClick.bind(this);
  }

  onClick = async () => {
    this.setState({loading: true});
    try {
      const response = await fetch(
        PAYMENT_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            info: {
              full_name: this.state.username,
              credit_card_number: '1234 1234 1234 1234',
              cvv: '111'
            },
            metadata: {
              amount: 500,
              type: 'credit_card'
            },
            order_id: this.state.order.order_id
          })
        }
      );
      const respObj = await response.json();

      if (response.status !== 200) {
        this.setState({loading: false, error: respObj.toString(), paymentDone: false});
      } else {
        this.setState({paymentDone: true, loading: false, error: null});
      }
    } catch (err) {
      this.setState({loading: false, error: err.toString(), paymentDone: false});
    }
  }

  render () {
    if (!this.props.order.order_valid) {
      return (
        <button className="btn btn-primary" disabled>Waiting for order validation...</button>
      )
    }

    if (this.props.order.payment_valid) {
      return (
        null
      )
    }

    if (this.state.error) {
      console.error(JSON.stringify(this.state.error, null, 2));
    }

    const buttonText = () => {
      const { loading, paymentDone, error} = this.state;
      if (loading) { return "Processing ..."; }
      if (error) { return "Error! Try again"; }
      if (paymentDone) { return "Done!"; }
      return "Make payment";
    }

    return (
      <div>
        <h4>Card details:</h4>
        <b>Name:</b> {this.props.username}<br/>
        <b>Card number:</b> 1234 1234 1234 1234<br/>
        <b>CVV: </b> 111 <br/>
        <b>Amount: </b> ₹500<br/>
        <br/>
        <button
          className="btn btn-primary"
          disabled={this.state.loading}
          onClick={this.onClick}
        >
          {buttonText()}
        </button>
      </div>
    );
  }
}
export default OrderStatus;
