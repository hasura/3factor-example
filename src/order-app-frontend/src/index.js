import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

import 'bootstrap/dist/css/bootstrap.css';
// import 'bootstrap/dist/css/bootstrap-theme.css';

import { ApolloProvider } from "react-apollo";
import ApolloClient from "apollo-client";
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import { HttpLink } from 'apollo-link-http';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';

const wsurl = process.env.REACT_APP_HASURA_WEBSOCKET_URL || "ws://localhost:8080/v1alpha1/graphql";
const httpurl = process.env.REACT_APP_HASURA_HTTP_URL || "http://localhost:8080/v1alpha1/graphql";

const wsLink = new WebSocketLink({
  uri: wsurl,
  options: {
    reconnect: true,
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

ReactDOM.render(
  (<ApolloProvider client={client}><App /></ApolloProvider>),
  document.getElementById('root'));
