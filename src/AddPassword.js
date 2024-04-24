import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AddPassword.css'; 

function AddPassword() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const service_name = formData.get('website');
    const username = formData.get('username');
    const password = formData.get('password');

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3001/api/password/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ service_name, username, password }),
      });

      if (response.ok) {
        alert('Password added successfully');
        navigate('/dashboard'); 
      } else {
        const errorResponse = await response.json();
        alert(`Failed to add password: ${errorResponse.message}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="container">  
      <h2>Add Password</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Website:
          <input type="text" name="website" required />
        </label>
        <br />
        <label>
          Username:
          <input type="text" name="username" required />
        </label>
        <br />
        <label>
          Password:
          <input type="password" name="password" required />
        </label>
        <br />
        <button type="submit">Add Password</button>
      </form>
      
      <Link to="/password-generator"><button style={{ fontWeight: 'bold' }}>Generate Password/Test Strength</button></Link>
      <Link to="/dashboard"><button style={{ fontWeight: 'bold' }}>Go back to Dashboard</button></Link>
    </div>
  );
}

export default AddPassword;
