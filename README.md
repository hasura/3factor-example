# 3Factor Canonical App

This is a canonical app for 3factor which showcases the three factors in detail with a reference implementation. The reference implementation is a food ordering app which has a user facing component (order-app) and an admin dashboard (analytics-app).

You can follow along this step-by-step guide to deploy and evaluate this application design pattern yourself.

## What is a 3Factor App?

From [3factor.app](https://3factor.app/) :

> Today, it is possible to build backends for apps that allow for fast iteration,  while being resilient and highly scalable from the get go.
>
> We propose an architecture pattern which is composed of 3 factors:
>
> 1) Realtime GraphQL
>
> 2) Event-driven
>
> 3) Async serverless

Here is the high-level diagram comparing a traditional architecture vs a 3factor architecture:

![3factor-migration](https://3factor.app/3factor-migration.png)

## Step-by-Step Guide

### Stack

NodeJS 8.1

Postgres 9.5+

Hasura GraphQL Engine

AWS Lambda

### Step 1: Model application

The core modeling of a 3factor app is very similar to traditional application modeling: we start by defining the schema and then define different functional components. The main difference is that 3factor emphasizes that each function be atomic (i.e. either happens completely or doesn't happen at all) and invoked via (persisted) events.

#### Schema

The schema of our application is defined in `migrations.sql` which you can apply on your postgres database.

```bash

$ export POSTGRES_CONNECTION_STRING='postgres://postgres:password@localhost:5432/postgres'

$ psql $POSTGRES_CONNECTION_STRING < migrations.sql

```
In the above snippet, we are running a postgres database on localhost.

#### Functions

Next, let's design the order workflow and describe its functional components. The order workflow consists of all the steps from a user placing an order to delivery agent assignment for the order.

**Order workflow:** Login -> Place order -> Validate order -> Payment -> Restaurant approval -> Agent assignment

Let's describe these steps in detail and refer to their source code:

1) **Login:** A user enters the app using a username. For this demo, there is no authentication.

2) **Place order:** The user selects food items and places an order.

3) **Validate order:** As soon as an order is placed, it is validated in the backend.

4) **Payment:** After the order is validated, user is requested for payment.

5) **Restaurant approval:** After successful payment for the order, restaurant receives and approves the order.

6) **Agent assignment:** After restaurant approves, an agent is assigned for delivery of the order.

Next, let's get into development.

### Step 2: Setup a realtime GraphQL interface

3factor requires the frontend use GraphQL for querying and performing actions. The reason for this is two-fold: fast iteration and realtime feedback. 

We will use Hasura to get GraphQL APIs over our existing postgres database. We will use Docker to run Hasura. If you do not have Docker, you can install it from here.

If you have a remote postgres database, run the following command:
```bash
$ docker run -d -p 8080:8080 \
  -e HASURA_GRAPHQL_DATABASE_URL=$POSTGRES_CONNECTION_STRING \
  -e HASURA_GRAPHQL_ENABLE_CONSOLE=true \
  hasura/graphql-engine:latest
```

If your postgres database is running on localhost, run the following command instead:

```bash
$ docker run -d --net=host \
  -e HASURA_GRAPHQL_DATABASE_URL=$POSTGRES_CONNECTION_STRING \
  -e HASURA_GRAPHQL_ENABLE_CONSOLE=true \
  hasura/graphql-engine:latest
```

Open the Hasura console by visiting http://localhost:8080/console. In the `Data` tab, you will see all the tables in our postgres database. Just track them all to get GraphQL APIs over them instantly:

![track-all](assets/track-all.png)

Hasura will also detect relationships (via foreign-keys) automatically and you can track them as well to get GraphQL APIs over relationships:

![track-all-relations](assets/track-all-relations.png)

### Step 3: Local development 

Now, we can write our frontend using GraphQL APIs. We can perform the following actions directly via the frontend using authenticated GraphQL APIs:

1) **Login**
2) **Place order**

Refer to [src/order-app-frontend](src/order-app-frontend) for the frontend source code. Run the frontend app as follows:

```bash
$ cd src/order-app-frontend
$ npm install
$ npm start
```

We need to setup a development environment for our backend. We need to write backend logic for the following steps:

1) **Validate order:** Source code: [validate-order](src/backend/validate-order)

2) **Payment:**  Source code: [payment](src/backend/payment)

3) **Restaurant approval:**  Source code: [restaurant-approval](src/backend/restaurant-approval)

4) **Agent assignment:** Source code: [agent-assignment](src/backend/agent-assignment)

For this purpose, we will run a node server with each of the above functions exposed as HTTP APIs as defined in [src/backend/localDevelopment.js](src/backend/localDevelopment.js). Run the server and try these functions out:

```bash
$ cd src/backend
$ npm install
$ node localDevelopment.js

Output: server running on port 8081
```

In a different terminal: 

```bash
$ curl -d '{"order_id": "abc-ad21-adf"}' -H 'Content-Type: application/json' localhost:8081/validate-order
```

### Step 4: Setup event system

Now that we have our frontend components and backend components ready, it is time to glue everything together via events. The event system is at the center of 3factor architecture. The event system is what drives the entire workflow: from the frontend initiating the events to the backend triggering functions on emitted events.

The order workflow is initiated by the user creating an event (via an insert to the order table) and ends with the backend creating an event for agent assignment (via an update to the order table). 

In the frontend, we will subscribe to the events on `order` table via realtime GraphQL and update the UI.

In the backend, we will use Hasura Event Triggers to invoke HTTP APIs when events are emitted. The backend requires the following Event Triggers:

1) validate_order: On `insert` of an order (via placeOrder.js).
2) restaurant_approval: On `update` of an order after successful payment (via payment.js).
3) agent_assignment: On `update` of an order after restaurant approval (via restaurantApproval.js).

Let's setup these triggers with our locally deployed functions (localServer.js). We can do this either interactively via the Hasura console or through Hasura API. Run the following command to setup these event triggers via Hasura API:

```bash
$ curl -d @event-triggers.json -H 'Content-Type: application/json' localhost:8080
```

This finishes the entire development cycle on our local machine. You can start testing the app now.

### Step 5: Use serverless functions

Now, that you have locally developed and tested your app. Let's deploy all our functions to AWS Lambda and update the Event Triggers from localhost HTTP APIs to Lambda APIs.

Serverless functions are a crucial component of 3factor as it ensures many requirements like infinite scale, no-ops and cost.

To prepare our HTTP APIs for Lambda, we need to wrap the business logic in a Lambda "context". The Lambda context for `validateOrder` is given in `validateOrderCtx.js`. Let's package this as a zip file and deploy to Lambda:

```bash
$ zip -r validateOrder.zip validateOrder/*
```

There are many tutorials to deploy a NodeJS package on AWS Lambda with API Gateway for e.g. [this](https://github.com/hasura/graphql-serverless/tree/master/aws-nodejs/apollo-sequelize#deployment). We will keep Lambda deployment out of the scope of this tutorial.

Assuming you have deployed your Lambda succesfully, you would have received an HTTP endpoint for it. Update your Event Triggers with the new endpoints and that's it.

#### Connection Pooling

The Lambda functions need database connections to execute their logic which cannot scale at the same rate as serverless invocations (as database connections are slow and costly). Hence, we need an external connection pooler to "loadbalance" the database connections.

With Postgres, we can add a standalone connection pooler like [pgBouncer](https://pgbouncer.github.io/) to accomplish this. 

Follow the guide [here](https://github.com/hasura/graphql-serverless/tree/master/aws-nodejs/apollo-sequelize#connection-pooling) to deploy pgBouncer in few clicks on a free EC2 instance using AWS Cloudformation. The output of the cloudformation template should give a new `POSTGRES_CONNECTION_STRING` which you can update in your Lambda to start using pgBouncer.

