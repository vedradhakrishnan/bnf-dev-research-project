import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [number, setNumber] = useState<number>(0); // State to store the numeric value

  // Function to handle button click
  const handleClick = () => {
    console.log(`The number entered is: ${number}`);
    // Additional actions can be taken here
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        {/* Numeric input field */}
        <input
          type="number"
          value={number}
          onChange={e => setNumber(parseFloat(e.target.value))}
          placeholder="Enter a number"
        />
        {/* Button to submit the input */}
        <button onClick={handleClick}>Submit Number</button>
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
