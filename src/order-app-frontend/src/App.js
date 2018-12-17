import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Link, Switch} from "react-router-dom";
import Orders from './Orders';
import PlaceOrder from './PlaceOrder';
import OrderStatus from './OrderStatus';
// import {Button, Grid, Jumbotron, FormControl, FormGroup, ControlLabel, HelpBlock} from 'react-bootstrap';

class App extends React.Component {
  constructor (props) {
    super(props);
    const username = window.localStorage.getItem('username');
    this.state = {username};
    this.handleChange = this.handleChange.bind(this);
    this.onSave = this.onSave.bind(this);
    this.logout = this.logout.bind(this);
  }

  handleChange (e) {
    this.setState({tempUsername: e.target.value});
  }

  onSave () {
    window.localStorage.setItem('username', this.state.tempUsername);
    this.setState({username: this.state.tempUsername})
  }

  logout () {
    window.localStorage.removeItem('username');
    this.setState({username: undefined})
  }

  render () {
    return (
      <Router>
        <Switch>
          <Route exact path="/" render={(routeProps) =>
            (<Home routeProps={routeProps} logout={this.logout} username={this.state.username} onChange={this.handleChange} onClick={this.onSave} />)
          } />
          <Route path="/place-order" render={(routeProps) =>
            (<PlaceOrder routeProps={routeProps} username={this.state.username} />)
          } />
          <Route path="/order/:orderId" render={({match}) =>
            (<OrderStatus orderId={match.params.orderId} username={this.state.username} />)
          } />
        </Switch>
      </Router>
    );
  }
}
/*
function FieldGroup({ id, label, help, ...props }) {
  return (
    <FormGroup controlId={id}>
      <label>{label}</label>
      <FormControl {...props} />
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
}
*/
const Home = ({username, onChange, onClick, logout}) => {
  if (username) {
    return (
      <div>
        <div className="container">
          <br/>
          <div class="jumbotron">
            <h1>Hi! {username} <span role="img" aria-label="emoji">🤓</span></h1>
          </div>
          <Link to="/place-order"><button className="btn btn-primary">Place new order</button></Link>
          &nbsp; &nbsp;
          <button className="btn btn-danger" onClick={logout}>Logout</button>
          <hr/>
          <Orders username={username} />
        </div>
        <div className="footerWrapper">
          <a href={'https://github.com/hasura/3factor-example'} target={'_blank'}>Source</a>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <div className="container">
          <br/>
          <div className="form-group">
            <label for="formControlsText" className="control-label">Enter username</label>
            <input type="text" id="formControlsText" className="form-control" placeholder="username" onChange={onChange}/>
          </div>
          {/*
          <FieldGroup
            id="formControlsText"
            type="text"
            label="Enter username"
            placeholder="username"
            onChange={onChange}
          />
          */}
          <button className="btn btn-primary" onClick={onClick}>Enter app</button>
        </div>
        <div className="footerWrapper">
          <a href={'https://github.com/hasura/3factor-example'} target={'_blank'}>Source</a>
        </div>
      </div>
    );
  }
}

export default App;
