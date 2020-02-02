import React from 'react';
import logo from './logo.svg';
import './App.css';
import "./components/DisplayView"
import DisplayView from './components/DisplayView';
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <DisplayView></DisplayView>
      </header>
    </div>
  );
}

export default App;
