import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css'; // Import the CSS file

const AdminLogin = ({ setIsAdminAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Make an API call to authenticate admin
    const response = await fetch('http://backend-for-hostted-server.vercel.app/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      // On successful login, store the token and update the authentication state
      localStorage.setItem('adminToken', data.token);  // Store token in localStorage
      setIsAdminAuthenticated(true);
      navigate('/admin/home');  // Redirect to Admin Home Page
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-form" onSubmit={handleLogin}>
        <h2>Admin Login</h2>
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <button type="submit">Login</button>
        
        <a href="/forgot-password" className="forgot-password">Forgot password?</a>
      </form>
    </div>
  );
};

export default AdminLogin;
