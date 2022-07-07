import React from 'react';
import './App.css';
// This is to make sure that images are packed in the build folder
import "./images";
import { getImageUrl } from './utils';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={getImageUrl("logo.svg")} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
