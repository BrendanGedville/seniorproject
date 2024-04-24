// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import AddPassword from './AddPassword';
import CreateAccount from './CreateAccount';
import PasswordGenerator from './PasswordGenerator';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-password" element={<AddPassword />} />
        <Route path="/create-account" element={<CreateAccount />} /> 
        <Route path="/login" element={<Login />} /> 
        <Route path="/password-generator" element={<PasswordGenerator />} /> 
      </Routes>
    </Router>
  );
}

export default App;
