import React, { useState } from 'react';

function PasswordStrength({ password }) {
  const [strength, setStrength] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  const calculateStrength = () => {
    // Calculate password strength based on various criteria
    let score = 0;
    let recommendations = [];

    // Check password length
    if (password.length >= 8) {
      score += 1;
    } else {
      recommendations.push('Use a password with at least 8 characters.');
    }

    // Check if password contains uppercase letters
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      recommendations.push('Include uppercase letters in your password.');
    }

    // Check if password contains lowercase letters
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      recommendations.push('Include lowercase letters in your password.');
    }

    // Check if password contains numbers
    if (/\d/.test(password)) {
      score += 1;
    } else {
      recommendations.push('Include numbers in your password.');
    }

    // Check if password contains special characters
    if (/[!@#$%^&*()?/]/.test(password)) {
      score += 1;
    } else {
      recommendations.push('Include special characters in your password.');
    }

    // Set password strength rating and recommendations
    setStrength(score);
    setRecommendations(recommendations);
  };

  return (
    <div>
      <h3>Password Strength: {strength}</h3>
      <ul>
        {recommendations.map((recommendation, index) => (
          <li key={index}>{recommendation}</li>
        ))}
      </ul>
    </div>
  );
}

export default PasswordStrength;
