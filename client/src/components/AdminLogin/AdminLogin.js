import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';  // Import the CSS file

const AdminLogin = ({ setIsAdminAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear any previous errors

    try {
      // Make an API call to authenticate admin
      const response = await fetch('https://backend-for-hostted-server.vercel.app/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,  // Use state variables
          password: password,  // Use state variables
        }),
      });
      const data = await response.json();
      
      console.log(data);  // Log the response to verify the backend response structure

      if (response.ok) {
        console.log('Login Successful:', data);

        // Store the token and send it in subsequent requests
        localStorage.setItem('adminToken', data.token);  // Store as 'adminToken'

        // Ensure setIsAdminAuthenticated is a function
        if (typeof setIsAdminAuthenticated === 'function') {
          setIsAdminAuthenticated(true);  // Update admin authentication state
        } else {
          console.error('setIsAdminAuthenticated is not a function');
        }

        // Redirect to admin home page after login
        navigate('/admin-home');  // Redirect to the admin home page
      } else {
        console.log('Login Failed:', data);
        setErrorMessage('Invalid credentials'); // Show error message
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-form" onSubmit={handleLogin}>
        <h2>Admin Login</h2>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>

        <a href="/forgot-password" className="forgot-password">Forgot password?</a>
      </form>
    </div>
  );
};

export default AdminLogin;
