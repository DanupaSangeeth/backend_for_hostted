// AdminHome.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminHome = () => {
    const [data, setData] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8086/admin/home', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setData(response.data);
            } catch (err) {
                setError('Error fetching data or unauthorized access.');
            }
        };
        fetchAdminData();
    }, []);

    return (
        <div className="admin-home">
            <h2>Admin Dashboard</h2>
            {error ? <p className="error-message">{error}</p> : <p>{data}</p>}
        </div>
    );
};

export default AdminHome;
