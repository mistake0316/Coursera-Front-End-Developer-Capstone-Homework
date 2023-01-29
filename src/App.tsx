import React, { ReactElement, ReactFragment, useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Header from './Header';
import {fetchAPI, submitAPI} from './fetchRelative';
import Form from './ConfirmBooking';

import FloatingPanelContext from './contexts';

function App() {
  useEffect(
    ()=>{
      console.log(fetchAPI(new Date()));
      console.log(process.env);
    }
    ,[]
  )
  const [FloatingPanelDom, updatePanel] = useState<JSX.Element | null>(null);
  return (
    <FloatingPanelContext.Provider
      value={{
        currentPanel: FloatingPanelDom,
        setPanel:updatePanel
      }}>
      <Header page="Booking Table"/>
      <div className="App">
        <Form/>
        {FloatingPanelDom}
      </div>
    </FloatingPanelContext.Provider>
  );
}

export default App;
