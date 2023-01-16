import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

import {fetchAPI, submitAPI} from './fetchRelative';
import Form from './ConfirmBooking';

function App() {
  useEffect(
    ()=>{
      console.log(fetchAPI(new Date()));
      console.log(process.env);
    }
    ,[]
  )
  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
      <Form/>
    </div>
  );
}

export default App;
