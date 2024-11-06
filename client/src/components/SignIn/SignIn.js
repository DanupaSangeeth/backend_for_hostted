import React, { useState } from 'react';
import './SignIn.css';
import background from '../../assets/bg.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignIn = () => {
    const [values, setValues] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        setValues({
            ...values,
            [e.target.name]: e.target.value,
        });
    };

   
    const validate = (values) => {
        const errors = {};
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

        if (!values.email) {
            errors.email = "Email is required.";
        } else if (!emailPattern.test(values.email)) {
            errors.email = "Email is not valid.";
        }

        if (!values.password) {
            errors.password = "Password is required.";
        } else if (values.password.length < 6) {
            errors.password = "Password must be at least 6 characters long.";
        }

        return errors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validate(values);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) { 
            try {
                const res = await axios.post('http://localhost:8085/signin', values);

                if (res.data.token) { 
                    localStorage.setItem('token', res.data.token); 
                    toast.success('Login successful!');
                    navigate('/home');
                } else {
                    toast.error("No records existed");
                }
            } catch (err) {
                console.error('Error:', err);
                toast.error("An error occurred. Please try again.");
            }
        }
    };

    return (
        <div>
            <div className="container">
                <div className="img">
                    <h1 className="title1">SIGN IN</h1>
                    <img src={background} alt="background" />
                </div>
                <div className="login-content">
                    <form onSubmit={handleSubmit}>
                        <h2 className="title">Welcome Back</h2>

                        <div className="input-div one">
                            <div className="i">
                                <i className="fas fa-envelope"></i>
                            </div>
                            <div className="div">
                                <input 
                                    type="email" 
                                    className="input" 
                                    placeholder='Email'
                                    name="email"
                                    value={values.email}
                                    onChange={handleChange} 
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>} {/* Display email error */}
                            </div>
                        </div>

                        <div className="input-div pass">
                            <div className="i">
                                <i className="fas fa-lock"></i>
                            </div>
                            <div className="div">
                                <input 
                                    type="password" 
                                    className="input" 
                                    placeholder='Password'
                                    name="password"
                                    value={values.password}
                                    onChange={handleChange} 
                                />
                                {errors.password && <span className="error-message">{errors.password}</span>} {/* Display password error */}
                            </div>
                        </div>

                        <input type="submit" className="btn" value="Sign In" />
                        <a href='/signup' className="abtn">SIGN UP</a>
                        <p>Don't Have An Account?</p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
