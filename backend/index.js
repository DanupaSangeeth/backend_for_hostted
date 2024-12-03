const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require('dotenv').config();
const nodemailer = require("nodemailer");

const app = express();
app.use(cors({
    origin: ['https://backend-for-hostted-client.vercel.app'],  // Add your front-end domain here
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create MySQL connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Database connected successfully");
        connection.release(); // release the connection back to the pool
    }
});

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";


// Configure Sendinblue SMTP
const mailTransporter = nodemailer.createTransport({
    host: "smtp-relay.sendinblue.com", // Sendinblue SMTP server
    port: 587, // TLS port
    secure: false, // Use `true` for port 465
    auth: {
        user: process.env.SENDINBLUE_EMAIL, // Your Sendinblue login email
        pass: process.env.SENDINBLUE_SMTP_KEY, // Your Sendinblue SMTP key
    },
});

// Verify Sendinblue configuration
mailTransporter.verify((error, success) => {
    if (error) {
        console.error("Error configuring Sendinblue email transporter:", error);
    } else {
        console.log("Sendinblue email transporter is ready");
    }
});

// Function to send email
async function sendEmail(to, subject, htmlContent) {
    const mailOptions = {
        from: `"Your App Name" <${process.env.SENDINBLUE_EMAIL}>`, // Your app's "from" email
        to,
        subject,
        text: htmlContent.replace(/<\/?[^>]+(>|$)/g, ""), // Plain-text fallback
        html: htmlContent, // HTML content
    };

    try {
        await mailTransporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

// Middleware for authenticating JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json("Access Denied: No Token Provided");

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error("Token verification failed:", err);
            return res.status(403).json("Invalid Token");
        }
        req.user = user;
        next();
    });
}

// Log action to the activity_logs table
function logAction(userId, action) {
    const sql = "INSERT INTO activity_logs (user_id, action) VALUES (?, ?)";
    db.query(sql, [userId, action], (err) => {
        if (err) console.error("Error logging action:", err);
    });
}

// Sign-up route for new users with email verification
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json("All fields are required");
    }

    try {
        const checkUserSql = "SELECT * FROM users WHERE email = ?";
        db.query(checkUserSql, [email], async (err, data) => {
            if (err) return res.status(500).json("Database error");

            if (data.length > 0) {
                return res.status(400).json("User already exists");
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

            const insertUserSql = "INSERT INTO users (name, email, password, verified) VALUES (?, ?, ?, ?)";
            db.query(insertUserSql, [name, email, hashedPassword, false], async (err) => {
                if (err) return res.status(500).json("Error registering user");

                const verificationLink = `https://backend-for-hostted-client.vercel.app/verify-email?token=${token}`;
                const emailContent = `
                    <p>Hi ${name},</p>
                    <p>Thank you for signing up! Please verify your email by clicking the link below:</p>
                    <a href="${verificationLink}">Verify Email</a>
                    <p>This link will expire in 1 hour.</p>
                    <p>Best Regards,<br>Your Website Team</p>
                `;

                try {
                    await sendEmail(email, "Verify Your Email", emailContent);
                    res.json("Sign-up successful! Please check your email to verify your account.");
                } catch (emailError) {
                    console.error("Error sending email:", emailError);
                    res.status(500).json("Failed to send verification email");
                }
            });
        });
    } catch (err) {
        console.error("Error during sign-up:", err);
        res.status(500).json("Error during sign-up");
    }
});

// Middleware for authenticating JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json("Access Denied: No Token Provided");

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error("Token verification failed:", err);
            return res.status(403).json("Invalid Token");
        }
        req.user = user;
        next();
    });
}

async function createAdmin(email, plainPassword) {
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // SQL query to insert admin with hashed password
        const sql = "INSERT INTO admins (email, password) VALUES (?, ?)";

        return new Promise((resolve, reject) => {
            db.query(sql, [email, hashedPassword], (err, result) => {
                if (err) {
                    console.error("Error inserting admin:", err);
                    reject(err);
                } else {
                    console.log("Admin created successfully:", result);
                    resolve(result);
                }
            });
            
        });
    } catch (error) {
        console.error("Error during admin creation:", error);
        throw error;
    }
}

// Middleware for authenticating JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json("Access Denied: No Token Provided");

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error("Token verification failed:", err);
            return res.status(403).json("Invalid Token");
        }
        req.user = user;
        next();
    });
}

// Log action to the activity_logs table
function logAction(userId, action) {
    const sql = "INSERT INTO activity_logs (user_id, action) VALUES (?, ?)";
    db.query(sql, [userId, action], (err) => {
        if (err) console.error("Error logging action:", err);
    });
}






// Sign-in route for authentication with password validation
app.post("/signin", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, data) => {
        if (err) {
            return res.status(500).json("Error");
        }
        if (data.length > 0) {
            const user = data[0];

            // Compare password with the hashed password in the database
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json("Invalid Credentials");
            }

            // Generate JWT token
            const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });

            logAction(user.id, "Signed in");

            res.json({ message: "Success", token });
        } else {
            return res.status(401).json("User not found");
        }
    });
});

// Admin login route
app.post("/admin-login", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM admins WHERE email = ?";

    db.query(sql, [email], async (err, data) => {
        if (err) {
            return res.status(500).json("Error");
        }
        if (data.length > 0) {
            const admin = data[0];

            // Compare password with the hashed password in the database
            const isPasswordValid = await bcrypt.compare(password, admin.password);
            if (!isPasswordValid) {
                return res.status(401).json("Invalid Credentials");
            }

            // Generate JWT token
            const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '1h' });

            logAction(admin.id, "Admin logged in");

            res.json({ message: "Admin login successful", token });
        } else {
            return res.status(401).json("Admin not found");
        }
    });
});

// Protected route to fetch user data
app.get("/users", authenticateToken, (req, res) => {
    const sql = "SELECT * FROM users WHERE id = ?";

    db.query(sql, [req.user.id], (err, data) => {
        if (err) {
            return res.status(500).json("Error fetching data");
        }

        logAction(req.user.id, "Viewed own data");

        if (data.length > 0) {
            return res.json(data[0]);
        } else {
            return res.status(404).json("User not found");
        }
    });
});

// Protected admin route
app.get("/admin-home", authenticateToken, (req, res) => {
    // Check if the user is an admin
    if (req.user && req.user.email) {
        const sql = "SELECT * FROM admins WHERE email = ?";
        db.query(sql, [req.user.email], (err, data) => {
            if (err) {
                return res.status(500).json("Error");
            }
            if (data.length > 0) {
                res.json({ message: "Welcome to Admin Home", admin: data[0] });
            } else {
                return res.status(403).json("Access Denied: You are not an admin");
            }
        });
    } else {
        return res.status(403).json("Access Denied: Invalid Token");
    }
});

app.post("/create-admin", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Call createAdmin function to insert admin with hashed password
        await createAdmin(email, password);
        res.status(201).json({ message: "Admin created successfully" });
    } catch (err) {
        res.status(500).json({ error: "Error creating admin" });
    }
});


createAdmin("admin@gmail.com", "Admin0011");


app.get("/", (req, res) => {
    res.send("hello world");
});

// Start the server
const PORT = process.env.PORT || 8085;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});