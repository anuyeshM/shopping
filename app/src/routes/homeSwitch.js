import React from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';

import Homepage from '../components/homepage/homepage';
import ServicesSwitch from './servicesSwitch';
import Home from '../screens/home/homeScreen';

const HomeSwitch = (props) => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`/home`}>
        <Homepage {...props} />
      </Route>
      <Route exact path={`/premiumServices`}>
        <ServicesSwitch {...props} />
      </Route>
      <Route exact path={`/:storecode`}>
        <Home {...props} />
      </Route>
      <Redirect from={path} to={`/home`} />
    </Switch>
  );
};

export default HomeSwitch;
