import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Home.css';

function Home() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    profilePicture: null,
  });

  const [userInfo, setUserInfo] = useState({
    id: '',
    email: '',
    name: '',
  });

  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token'); 

        if (!token) {
          console.error('No token found, user is not authenticated.');
          navigate('/signin'); 
          return; 
        }

        const response = await fetch('http://localhost:8085/users', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json', 
          },
        });

        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        setUserInfo({
          id: data.id, 
          email: data.email,
          name: data.name,
        });

        setFormData({
          fullName: data.name || '', 
          email: data.email || '', 
          profilePicture: null, 
        });
      } catch (error) {
        console.error('Error fetching user data:', error.message); 
      }
    };

    fetchUserData();
  }, [navigate]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePicture: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
  };

  const handleLogout = () => {
    // Show a confirmation dialog
    const confirmLogout = window.confirm('Are you sure you want to log out?');

    // If the user confirms, proceed with logout
    if (confirmLogout) {
      localStorage.removeItem('token');
      console.log('User logged out');
      navigate('/'); 
    } else {
      console.log('Logout canceled');
    }
  };

  return (
    <div className='home'>
      <div className="app-container">
        <div className="profile-card">
          <div className="profile-image">
            <img
              src={formData.profilePicture ? URL.createObjectURL(formData.profilePicture) : "https://via.placeholder.com/150"}
              alt="Profile"
            />
          </div>
          <h2>{formData.fullName}</h2>
          <div className="user-info">
            <p className='user_data'><b>User ID: {userInfo.id}</b></p>
            <p className='user_data'><b>Name: {userInfo.name}</b></p>
            <p className='user_data'><b>Email: {userInfo.email}</b></p>
          </div>
          <div className="buttons">
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="edit-profile-form">
          <h2 className='home_h1'>Edit Profile</h2>
          <form className='edit_home' onSubmit={handleSubmit}>
            <label>Full Name</label>
            <input 
              type="text" 
              name="fullName"
              className='home_input' 
              value={formData.fullName} 
              onChange={handleChange} 
            />
            
            <label>Email</label>
            <input 
              type="text"
              name="email"
              className='home_input' 
              value={formData.email} 
              onChange={handleChange} 
            />
            
            <label>Profile Picture</label>
            <input 
              type="file" 
              name="profilePicture" 
              className='home_input' 
              onChange={handleFileChange} 
            />
            
            <button type="submit" className="update-btn">Update</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;
