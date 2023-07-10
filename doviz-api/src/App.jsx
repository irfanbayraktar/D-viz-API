import { useState,useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import WebSocketExample from './websocket'

function App() {
  return (
    <div className="App">
      <WebSocketExample/>
    </div>
  );
}

export default App;