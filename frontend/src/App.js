import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import Parts from './pages/Parts';
import Login from './components/Login';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/parts" component={Parts} />
        <Route path="/login" component={Login} />
      </Switch>
    </Router>
  );
};

export default App;
