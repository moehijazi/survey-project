import React, { useState } from "react";
import { Switch, Route } from "react-router-dom";

import SignIn from "../Pages/SignIn/SignIn";
import PassReset from "../Pages/PassReset/PassReset";

const Routes = () => {
  const [logCheck, setLogCheck] = useState(false);
  return (
    <Switch>
      <Route path="/login" exact component={SignIn} />
      <Route path="/passreset" component={PassReset} />
      <Route component={SignIn} />
    </Switch>
  );
};

export default Routes;
