import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Registration from './components/Registration';
import Login from './components/Login';


export default () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Registration} />
        <Route path="/login" component={Login} />
      </Switch>
    </Router>
  );
};
