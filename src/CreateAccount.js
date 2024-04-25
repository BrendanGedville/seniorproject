import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './CreateAccount.css';

function CreateAccount() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = { username, email, password };

    try {
      const response = await fetch('https://password-manager1-d7a6dad7b8d2.herokuapp.com/api/accounts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      alert(data.message);
      navigate('/login');
    } catch (error) {
      console.error('Failed to create account:', error);
      alert('Failed to create account');
    }
  };

  return (
    <div className="create-account-container">
      <h1 className="create-account-header">Create Account</h1>
      <form className="create-account-form" onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            className="create-account-input"
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label>
          Email:
          <input
            className="create-account-input"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password:
          <input
            className="create-account-input"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="create-account-button" type="submit">Create Account</button>
      </form>
     
      <p className="login-link">Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}

export default CreateAccount;
