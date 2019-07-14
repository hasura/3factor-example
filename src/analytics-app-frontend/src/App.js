import React, { Component } from 'react';
import './App.css';

import gql from "graphql-tag";
import {Subscription } from "react-apollo";

import { ApolloProvider } from "react-apollo";
import ApolloClient from "apollo-client";
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import { HttpLink } from 'apollo-link-http';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';

const wsurl = process.env.REACT_APP_HASURA_WEBSOCKET_URL || "ws://localhost:8080/v1alpha1/graphql";
const httpurl = process.env.REACT_APP_HASURA_HTTP_URL || "http://localhost:8080/v1alpha1/graphql";
const adminSecret = process.env.REACT_APP_HASURA_ADMIN_SECRET;

const wsLink = new WebSocketLink({
  uri: wsurl,
  options: {
    reconnect: true,
    connectionParams: {
      headers: {
        "x-hasura-admin-secret": adminSecret
      }
    }
  }
});
const httpLink = new HttpLink({
  uri: httpurl,
});

const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink,
)

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});


var LineChart = require("react-chartjs").Line;
var chartData = {
    labels: [1,1],
    datasets: [
        {
            label: "Placed",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(200,50,100,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(200,50,100,1)",
            data: []
        },
        {
            label: "Validated",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(150,100,100,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(150,100,100,1)",
            data: []
        },
        {
            label: "Paid",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(100,150,100,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(100,150,100,1)",
            data: []
        },
        {
            label: "Approved",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(50,200,100,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(50,200,100,1)",
            data: []
        },
        {
            label: "Assigned",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(0,200,100,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(0,200,100,1)",
            data: []
        }
    ]
};

const subscriptions = [
  {
    name: "number_orders",
    subscription: gql`
      subscription {
        number_orders {
          count
        }
      }
    `
  },
  {
    name: "number_order_validated",
    subscription: gql`
      subscription {
        number_order_validated {
          count
        }
      }
    `
  },
  {
    name: "number_order_payment_valid",
    subscription: gql`
      subscription {
        number_order_payment_valid {
          count
        }
      }
    `
  },
  {
    name: "number_order_approved",
    subscription: gql`
      subscription {
        number_order_approved {
          count
        }
      }
    `
  },
];

class App extends Component {
  state = {
    number_orders: 0,
    number_order_validated: 0,
    number_order_payment_valid: 0,
    number_order_approved: 0,
    number_order_driver_assigned: 0,
    loading: true,
    error: false
  }

  componentDidMount() {
    subscriptions.forEach(s => {
      client.subscribe({
        query: s.subscription
      }).subscribe({
        next: (event) => {
          this.setState({
            [s.name]: event.data[s.name][0].count,
            loading: false
          });
        },
        error: (error) => {
          console.error(error);
          this.setState({
            error: true,
            loading: false
          })
        }
      })
    });
  }
  render() {
    const {
      loading,
      error,
      number_orders,
      number_order_approved,
      number_order_driver_assigned,
      number_order_validated,
      number_order_payment_valid
    } = this.state;

    if (error) {
      return <div className="App">Error</div>;
    }

    chartData.datasets[0].data.push(number_orders);
    chartData.datasets[1].data.push(number_order_validated);
    chartData.datasets[2].data.push(number_order_payment_valid);
    chartData.datasets[3].data.push(number_order_approved);
    chartData.datasets[4].data.push(number_order_driver_assigned);
    chartData.labels.push(1);
    return (
      <ApolloProvider client={client}>
        <div className="App">
          {
            loading
            ?
            <p>Loading...</p>
            :
            (
              <LineChart data={chartData}
                options={{responsive: true, maintainAspectRatio: false,
                  scales: {
                    xAxes: [{ labels: { userCallback: () => ('') } }]
                  }
                }}
              />
            )
          }
        </div>
        <div className="footerWrapper">
          <a href={'https://github.com/hasura/3factor-example'} target={'_blank'}>Source</a>
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
