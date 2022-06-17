import React from 'react';
import logo from './logo.svg';
import './App.css';
import { FetchButton } from './FetchButton';

function App() {
  return (
    <div className="App">
      <p>Disabled</p>
      <FetchButton url={'https://httpbin.org/delay/3'} disabled={true} />
      
      <p>Timeout</p>
      <FetchButton url={'https://httpbin.org/delay/3'} timeout={2000} />

      <p>Normal</p>
      <FetchButton url={'https://httpbin.org/delay/3'} />
    </div>
  );
}

export default App;
