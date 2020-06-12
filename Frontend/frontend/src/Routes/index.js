import React from 'react';
import {Switch, Route} from 'react-router-dom';

import SignIn from '../Pages/SignIn/SignIn';
import PassReset from '../Pages/PassReset/PassReset';

const Routes = () => {
    return(
        <Switch>
      <Route path="/" exact component={SignIn} />
      <Route path="/passreset" component={PassReset} />
      <Route component={SignIn} />
    </Switch>
    );
}

export default Routes;