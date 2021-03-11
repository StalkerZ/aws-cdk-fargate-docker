import React from 'react'
import logo from './logo.svg'
import './App.css'

const secret = process.env.REACT_APP_SECRET
const envVar = process.env.REACT_APP_ENV_VAR

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello World!</p>
        <p>{secret}</p>
        <p>{envVar}</p>
      </header>
    </div>
  )
}

export default App
