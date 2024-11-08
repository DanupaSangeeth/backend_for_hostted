// AdminLogin.js
import React, { useState } from 'react';
import axios from 'axios';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8086/signin', { email, password });
            
            if (response.data.role === 'admin') {
                localStorage.setItem('token', response.data.token);
                setSuccess("Login successful! Redirecting to admin dashboard...");
                setTimeout(() => {
                    window.location.href = '/admin/home'; // Redirect to admin home page
                }, 2000);
            } else {
                setError("Unauthorized: Only admins can access this page.");
            }
        } catch (err) {
            setError("Invalid credentials. Please try again.");
        }
    };

    return (
        <div className="login-container">
            <h2>Admin Login</h2>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label>Email:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
        </div>
    );
};

export default AdminLogin;
