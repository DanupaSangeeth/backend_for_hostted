import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VerifyEmail = () => {
  const [token, setToken] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || '';

  const handleVerify = async () => {
    try {
      const response = await axios.post('https://backend-for-hostted-server.vercel.app/verify-email', { email, token });

      if (response.status === 200) {
        toast.success('Email verified successfully! You can now sign in.');
        navigate('/signin');
      }
    } catch (error) {
      console.error('Verification failed:', error);
      toast.error('Invalid token or verification failed.');
    }
  };

  return (
    <div>
      <h2>Email Verification</h2>
      <p>Enter the verification token sent to your email: {email}</p>
      <input
        type="text"
        placeholder="Verification Token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <button onClick={handleVerify}>Verify Email</button>
      <ToastContainer />
    </div>
  );
};

export default VerifyEmail;