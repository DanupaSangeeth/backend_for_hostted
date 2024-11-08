import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminHome.css'; // Import CSS file

const AdminHome = () => {
  const [adminData, setAdminData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('adminToken');

        if (!token) {
          alert('Unauthorized! Please login again.');
          navigate('/admin-login');
          return;
        }

        const response = await fetch('http://backend-for-hostted-server.vercel.app/admin-home', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setAdminData(data.admin);
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
    <div className="admin-home-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <ul className="sidebar-menu">
          <li><a href="/admin-dashboard">Dashboard</a></li>
          <li><a href="/admin-users">Users</a></li>
          <li><a href="/admin-settings">Settings</a></li>
          <li><a href="/logout" onClick={() => localStorage.removeItem('adminToken')}>Logout</a></li>
        </ul>
      </aside>
      <main className="admin-home-content">
        <h1>Welcome, Admin</h1>
        {adminData ? (
          <div className="admin-info">
            <p><strong>Email:</strong> {adminData.email}</p>
            <p><strong>ID:</strong> {adminData.id}</p>
          </div>
        ) : (
          <p>Loading admin data...</p>
        )}
      </main>
    </div>
  );
};

export default AdminHome;
