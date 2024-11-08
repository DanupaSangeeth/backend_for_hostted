import { useState } from "react";
import axios from "axios";
import "./AdminLogin.css";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://backend-for-hostted-server.vercel.app/admin-login", { email, password });
            const token = response.data.token;
            localStorage.setItem("adminToken", token);  // Store JWT token
            // Redirect to admin home page
            window.location.href = "/admin-home";  
        } catch (err) {
            setError("Invalid credentials");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {error && <div>{error}</div>}
            <button type="submit">Login</button>
        </form>
    );
};

export default AdminLogin;
