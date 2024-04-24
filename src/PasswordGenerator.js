import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './PasswordGenerator.css';

function PasswordGenerator() {
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLength, setPasswordLength] = useState(8);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [passwordRecommendations, setPasswordRecommendations] = useState([]);

  const generateRandomUppercase = () => {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
  };

  const generateRandomLowercase = () => {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
  };

  const generateRandomNumber = () => {
    return Math.floor(Math.random() * 10);
  };

  const generateRandomSpecialCharacter = () => {
    const specialCharacters = '!@#$%^&*()?/';
    return specialCharacters[Math.floor(Math.random() * specialCharacters.length)];
  };

  const generateRandomPassword = () => {
    let newPassword = '';
    newPassword += generateRandomUppercase();
    newPassword += generateRandomLowercase();
    newPassword += generateRandomNumber();
    newPassword += generateRandomSpecialCharacter();

    for (let i = 4; i < passwordLength; i++) {
      const randomCharType = Math.floor(Math.random() * 4);
      switch (randomCharType) {
        case 0:
          newPassword += generateRandomUppercase();
          break;
        case 1:
          newPassword += generateRandomLowercase();
          break;
        case 2:
          newPassword += generateRandomNumber();
          break;
        case 3:
          newPassword += generateRandomSpecialCharacter();
          break;
        default:
          break;
      }
    }

    newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('');
    setGeneratedPassword(newPassword);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordLengthChange = (e) => {
    const length = parseInt(e.target.value);
    if (length >= 8) {
      setPasswordLength(length);
    }
  };

  const handleUserPasswordChange = (e) => {
    setUserPassword(e.target.value);
  };

  const handleSubmitPassword = () => {
    const { strength, recommendations } = calculateStrength(userPassword);
    setPasswordStrength(strength);
    setPasswordRecommendations(recommendations);
  };

  const calculateStrength = (password) => {
    let score = 0;
    let recommendations = [];

    if (password.length < 8) {
      score = 1; 
      recommendations.push('Very weak! Use a password with at least 8 characters!');
      const strength1 = score.toString();
      return { strength1, recommendations };
  }

    if (password.length >= 8) {
      score += 1;
    } else {
      recommendations.push('Use a password with at least 8 characters.');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      recommendations.push('Include uppercase letters in your password.');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      recommendations.push('Include lowercase letters in your password.');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      recommendations.push('Include numbers in your password.');
    }

    if (/[!@#$%^&*()?/]/.test(password)) {
      score += 1;
    } else {
      recommendations.push('Include special characters in your password.');
    }

    const strength = score.toString();
    return { strength, recommendations };
  };

  return (
    <div className="password-generator-container">
      <h3>Need a password?</h3>
      <div>
        <label>Password Length: </label>
        <input type="number" min="8" max="50" value={passwordLength} onChange={handlePasswordLengthChange} />
        <p>Recommended length: 12 or more characters</p>
      </div>
      <button type="button" onClick={generateRandomPassword}>Generate Password</button>
      <button type="button" onClick={handleTogglePassword}>{showPassword ? 'Hide' : 'Show'} Password</button>
      {showPassword && <input type="text" value={generatedPassword} readOnly />}
      <div>
        <label>Test Your Own Password: </label>
        <input type="password" value={userPassword} onChange={handleUserPasswordChange} />
        <button type="button" onClick={handleSubmitPassword}>Test Password</button>
      </div>
      {passwordStrength !== null && (
        <div>
          <h3>Password Strength (1 = Weak, 5 = Strong): {passwordStrength}</h3>
          <ul>
            {passwordRecommendations.map((recommendation, index) => (
              <li key={index}>{recommendation}</li>
            ))}
          </ul>
        </div>
      )}
     <Link to="/add-password"><button style={{ fontWeight: 'bold' }}>Add Password</button></Link>
      <Link to="/dashboard"><button style={{ fontWeight: 'bold' }}>Go back to Dashboard</button></Link>
    </div>
  );
}

export default PasswordGenerator;
