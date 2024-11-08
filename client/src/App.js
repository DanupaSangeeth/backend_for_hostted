// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import AdminHome from './AdminHome';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingPage from './components/LandingPage/LandingPage';
import SignIn from './components/SignIn/SignIn';
import Home from './components/Home/Home';
import SignUp from './components/SignUp/SignUp';

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
                <Route path='/' element={<LandingPage/>}/>
                <Route path='/home' element={<Home/>}/>
                <Route path='/signin' element={<SignIn/>}/>
                <Route path='/signup' element={<SignUp/>}/>
                
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
