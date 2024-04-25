import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
function Login() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
      const response = await fetch('https://password-manager1-d7a6dad7b8d2.herokuapp.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const { token } = await response.json(); 
        localStorage.setItem('token', token); 
        navigate('/dashboard'); 
      } else {
        const error = await response.json();
        alert(error.message); 
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed, please try again later.');
    }
  };

  return (
    <div className="login-container">
      <h1>GuardianPass Login Page</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Username:
            <input type="text" name="username" required />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input type="password" name="password" required />
          </label>
        </div>
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <Link to="/create-account">Create one</Link></p>
    </div>
  );
}

export default Login;
