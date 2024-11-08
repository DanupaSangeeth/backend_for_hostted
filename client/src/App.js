import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingPage from './components/LandingPage/LandingPage';
import SignIn from './components/SignIn/SignIn';
import Home from './components/Home/Home';
import SignUp from './components/SignUp/SignUp';
import AdminLogin from './components/AdminLogin/AdminLogin'; // Admin login page
import AdminHome from './components/AdminHome/AdminHome'; // Admin home page
import { useNavigate } from 'react-router-dom';

function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Example to check if admin is authenticated (you can use JWT or session)
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAdminAuthenticated(true);
    }
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        {/* Toast notifications */}
        <ToastContainer position="top-center" style={{ marginTop: '70px' }} />
        
        {/* Main content */}
        <main>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Home page */}
            <Route path="/home" element={<Home />} />

            {/* Sign-in page */}
            <Route path="/signin" element={<SignIn />} />

            {/* Sign-up page */}
            <Route path="/signup" element={<SignUp />} />

            {/* Admin Login Page */}
            <Route path="/admin/login" element={<AdminLogin setIsAdminAuthenticated={setIsAdminAuthenticated} />} />

            {/* Protected Admin Home Page */}
            <Route
              path="/admin/home"
              element={isAdminAuthenticated ? <AdminHome /> : <SignIn />} // Only show Admin Home if authenticated
            />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
