// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import AdminHome from './AdminHome';

const App = () => {
    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        // In a real-world application, verify the token with the server for expiration, etc.
        return !!token;
    };

    return (
        <Router>
            <Switch>
                <Route path="/admin/login" component={AdminLogin} />
                
                <Route 
                    path="/admin/home" 
                    render={() => isAuthenticated() ? <AdminHome /> : <Redirect to="/admin/login" />} 
                />

                <Redirect from="/" to="/admin/login" />
            </Switch>
        </Router>
    );
};

export default App;
