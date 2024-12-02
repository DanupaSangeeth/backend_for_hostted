import React, { useState } from 'react';
import './SignUp.css';
import background from '../../assets/bg.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
    const [values, setValues] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    // Handle input changes
    const handleChange = (e) => {
        setValues({
            ...values,
            [e.target.name]: e.target.value,
        });
        setErrors((prev) => ({ ...prev, [e.target.name]: undefined })); // Clear specific field error
    };

    // Validate form inputs
    const validateForm = (values) => {
        let errors = {};

        if (!values.name.trim()) errors.name = 'Name is required';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!values.email.trim()) errors.email = 'Email is required';
        else if (!emailRegex.test(values.email)) errors.email = 'Enter a valid email address';

        if (!values.password) errors.password = 'Password is required';
        else if (values.password.length < 8) errors.password = 'Password must be at least 8 characters';

        if (!values.confirmPassword) errors.confirmPassword = 'Please confirm your password';
        else if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match';

        return errors;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm(values);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            try {
                const response = await axios.post('https://backend-for-hostted-server.vercel.app/signup', values);
                if (response.status === 200) {
                    const { token } = response.data;
                    localStorage.setItem('token', token);
                    toast.success('Signup successful! Please check your email to verify your account.');

                    // Reset form
                    setValues({
                        name: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                    });

                    // Navigate to verification page
                    navigate('/verify', { state: { email: values.email } });
                } else {
                    setErrors({ general: 'Signup failed. Please try again.' });
                }
            } catch (error) {
                console.error('Error:', error);
                const message = error.response?.status === 400
                    ? 'Invalid input data.'
                    : error.response?.status === 409
                    ? 'Email already exists.'
                    : 'An error occurred. Please try again later.';
                setErrors({ general: message });
                toast.error(message);
            }
        }
    };

    return (
        <div className="container">
            <div className="img">
                <h1 className="title1">SIGN UP</h1>
                <img src={background} alt="background" />
            </div>
            <div className="login-content">
                <form onSubmit={handleSubmit}>
                    <h2 className="title">Welcome</h2>

                    {errors.general && <p className="error-message" aria-live="assertive">{errors.general}</p>}

                    {/* Name Input */}
                    <div className="input-div one">
                        <div className="i">
                            <i className="fas fa-user"></i>
                        </div>
                        <div className="div">
                            <input
                                type="text"
                                className="input"
                                placeholder="Name"
                                name="name"
                                value={values.name}
                                onChange={handleChange}
                            />
                            {errors.name && <p className="error-message">{errors.name}</p>}
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="input-div one">
                        <div className="i">
                            <i className="fas fa-envelope"></i>
                        </div>
                        <div className="div">
                            <input
                                type="email"
                                className="input"
                                placeholder="Email"
                                name="email"
                                value={values.email}
                                onChange={handleChange}
                            />
                            {errors.email && <p className="error-message">{errors.email}</p>}
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="input-div one">
                        <div className="i">
                            <i className="fas fa-lock"></i>
                        </div>
                        <div className="div">
                            <input
                                type="password"
                                className="input"
                                placeholder="Password"
                                name="password"
                                value={values.password}
                                onChange={handleChange}
                            />
                            {errors.password && <p className="error-message">{errors.password}</p>}
                        </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="input-div one">
                        <div className="i">
                            <i className="fas fa-lock"></i>
                        </div>
                        <div className="div">
                            <input
                                type="password"
                                className="input"
                                placeholder="Confirm Password"
                                name="confirmPassword"
                                value={values.confirmPassword}
                                onChange={handleChange}
                            />
                            {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <input type="submit" className="btn" value="SUBMIT" />
                    <a href="/signin" className="abtn">SIGN IN</a>
                    <p>Already Have An Account?</p>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
};

export default SignUp;
