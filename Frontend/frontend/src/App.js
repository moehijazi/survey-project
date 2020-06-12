import React from 'react';
import './App.css';
import { Router } from 'react-router-dom';
import SignIn from './Pages/SignIn/SignIn';
import Routes from './Routes/index';
import history from './services/history';

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <Router history={history}>
        <Routes />
      </Router>
      </header>
    </div>
  );
}

export default App;
