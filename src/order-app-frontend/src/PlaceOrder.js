import React from 'react';
import {Grid, Checkbox, Button} from 'react-bootstrap';
import {Link} from "react-router-dom";
import gql from "graphql-tag";
import { Query, Mutation } from "react-apollo";

const uuidv1 = require('uuid/v1');

const GET_ITEMS= gql`
  query fetch_items {
    menu_items (order_by: {name: asc}) {
      name
    }
  }
`;

const PLACE_ORDER = gql`
  mutation ($uuid: String!, $items: [items_insert_input!]!, $user_id: String!) {
    insert_orders(objects: [
      {
        order_id: $uuid
        user_id: $user_id
        address: "my-address"
        restaurant_id: 1
      }]) {
      returning {
        order_id
      }
    },

    insert_items(objects: $items) {
      returning {
        id
      }
    }
  }
`;

const PLACE_10_ORDER = gql`
  mutation ($orders: [orders_insert_input!]!, $items: [items_insert_input!]!) {
    insert_orders(objects: $orders) {
      returning {
        order_id
      }
    },

    insert_items(objects: $items) {
      returning {
        id
      }
    }
  }
`;


class PlaceOrder extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      ordered: false,
      uuid: uuidv1(),
      items: {}
    };
    this.onClick = this.onClick.bind(this);
    this.handleChanged = this.handleChanged.bind(this);
  }

  onClick () {
    this.setState({ordered: true});
  }

  handleChanged (item_name) {
    const _this = this;
    return ((e) => {
      _this.setState({items: {..._this.state.items, [item_name]: e.target.checked}});
    });
  }

  render () {
    let innerComponent;

    // If not ordered yet
    if (!this.state.ordered) {
      innerComponent = (
        <Grid>
          <br/>
          <div>
            <h4>Choose items:</h4>
            <hr/>
            <Query query={GET_ITEMS}>
              {({loading, error, data}) => {
                if (loading) return "Loading items...";
                if (error) return `Error!: ${error}`;
                return data.menu_items.map((item, i) => (
                  <Checkbox key={i} onChange={this.handleChanged(item.name)}>{item.name}</Checkbox>
                ));
              }}
            </Query>
            <hr/>
            <Mutation mutation={PLACE_ORDER}>
              {(placeOrder, {loading, error, data}) => {
                if (data) {
                  this.props.routeProps.history.push('/order/'+this.state.uuid);
                }
                if (loading) {
                  return (<span><Button bsStyle="primary" disabled>Loading...</Button>&nbsp;&nbsp;</span>);
                }
                if (error) {
                  return (<span><Button bsStyle="primary" >Try again: {error.toString()}</Button>&nbsp;&nbsp;</span>);
                }
                const items = Object.keys(this.state.items).filter((item) => (
                  this.state.items[item]
                )).map((item) => (
                  {
                    order_id: this.state.uuid,
                    item
                  }));

                return (
                  <span>
                    <Button
                      bsStyle="primary"
                      onClick={(e) => {
                        if (items.length === 0) {
                          window.alert('No items selected.');
                          return;
                        }
                        placeOrder({
                          variables: {
                            uuid: this.state.uuid,
                            items,
                            user_id: this.props.username
                          }})
                      }}>
                      Order
                    </Button>&nbsp;&nbsp;
                  </span>
                );
              }}
            </Mutation>
            <Mutation mutation={PLACE_10_ORDER}>
              {(placeOrder, {loading, error, data}) => {
                if (data) {
                  this.props.routeProps.history.push('/');
                }
                if (loading) {
                  return (<span><Button bsStyle="primary" disabled>Loading...</Button>&nbsp;&nbsp;</span>);
                }
                if (error) {
                  return (<span><Button bsStyle="primary" >Try again: {error.toString()}</Button>&nbsp;&nbsp;</span>);
                }
                const items = Object.keys(this.state.items).filter((item) => (
                  this.state.items[item]
                )).map((item) => (
                  {
                    order_id: this.state.uuid,
                    item
                  }));

                const username = this.props.username;
                const orders = [...Array(1000).keys()].map(() => ({
                  order_id: uuidv1(),
                  user_id: username,
                  address: "my-address",
                  restaurant_id: 1
                }));
                let all_items = orders.map((o) => (
                  items.map((i) => ({
                    order_id: o.order_id,
                    item: i.item
                  }))));
                all_items = [].concat.apply([], all_items);
                return (
                  <span>
                    <Button
                      bsStyle="primary"
                      onClick={(e) => {
                        if (items.length === 0) {
                          window.alert('No items selected.');
                          return;
                        }
                        placeOrder({
                          variables: {
                            items: all_items,
                            orders: orders
                          }})
                      }}>
                      Order 1000 times
                    </Button>&nbsp;&nbsp;
                  </span>
                );
              }}
            </Mutation>
            <Link to="/"><Button bsStyle="danger">Cancel</Button></Link>
          </div>
        </Grid>
      );
    }

    // order placed
    else {
      innerComponent = "Order placed";
    }

    return (
      <Grid>
        <br/>
        {innerComponent}
      </Grid>
    );
  }
}
export default PlaceOrder;
