import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminHome = () => {
  const [adminData, setAdminData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch the token from localStorage
        const token = localStorage.getItem('adminToken');

        if (!token) {
          alert('Unauthorized! Please login again.');
          navigate('/admin-login'); // Redirect to login if no token found
          return;
        }

        // Fetch admin data from the server using the token for authentication
        const response = await fetch('http://localhost:8086/admin-home', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Send token in Authorization header
          },
        });

        const data = await response.json();

        if (response.ok) {
          setAdminData(data.admin);  // Set the admin data
        } else {
          alert('Access denied. Invalid token.');
          navigate('/admin-login');
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        alert('Something went wrong. Please try again later.');
      }
    };

    fetchAdminData();
  }, [navigate]);

  return (
    <div>
      <h1>Welcome, Admin</h1>
      {adminData ? (
        <div>
          <p>Email: {adminData.email}</p>
          <p>ID: {adminData.id}</p>
          {/* You can display more admin info here */}
        </div>
      ) : (
        <p>Loading admin data...</p>
      )}
    </div>
  );
};

export default AdminHome;
