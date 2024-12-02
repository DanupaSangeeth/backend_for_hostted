const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
require('dotenv').config();

const app = express();
app.use(cors({
    origin: '*',
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

// Configure Nodemailer with Zoho Mail
const mailTransporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465, // Use 587 for TLS
    secure: true, // true for SSL
    auth: {
        user: process.env.ZOHO_EMAIL, // Your Zoho email address
        pass: process.env.ZOHO_PASSWORD // Your Zoho email password or app-specific password
    }
});

// Verify the email transporter
mailTransporter.verify((error, success) => {
    if (error) {
        console.error("Error configuring email transporter:", error);
    } else {
        console.log("Email transporter is ready");
    }
});

// Send email function
async function sendEmail(to, subject, htmlContent) {
    const mailOptions = {
        from: process.env.ZOHO_EMAIL, // Sender address
        to, // Recipient email
        subject, // Subject line
        html: htmlContent // HTML body
    };

    return mailTransporter.sendMail(mailOptions);
}

// Example endpoint to send a verification email
app.get("/verify-email", (req, res) => {
    const { token } = req.query;

    if (!token) return res.status(400).json("Invalid verification link");

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("Token verification failed:", err);
            return res.status(400).json("Verification link expired or invalid");
        }

        const { email } = decoded;

        // Mark user as verified in the database
        const updateSql = "UPDATE users SET verified = true WHERE email = ?";
        db.query(updateSql, [email], (err, result) => {
            if (err || result.affectedRows === 0) {
                return res.status(500).json("Error verifying email");
            }
            res.send("Email verified successfully! You can now log in.");
        });
    });
});


// Function to hash and insert admin into the database
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

// Sign-up route for new users with password hashing
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user exists
        const checkUserSql = "SELECT * FROM users WHERE email = ?";
        db.query(checkUserSql, [email], async (err, data) => {
            if (err) return res.status(500).json("Database error");

            if (data.length > 0) {
                return res.status(400).json("User already exists");
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Generate verification token
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

            // Insert user into the database (unverified)
            const insertUserSql = "INSERT INTO users (name, email, password, verified) VALUES (?, ?, ?, ?)";
            db.query(insertUserSql, [name, email, hashedPassword, false], async (err) => {
                if (err) return res.status(500).json("Error registering user");

                // Send verification email
                const verificationLink = `https://danupa.me/verify-email?token=${token}`;
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

app.listen(8086, async () => {
    console.log("Server is running on port 8086");

    // Automatically create admin user when the server starts
    try {
      
        console.log("Admin created successfully on server startup");
    } catch (err) {
        console.error("Error creating admin:", err);
    }
});

createAdmin("admin@gmail.com", "Admin0011");


app.get("/", (req, res) => {
    res.send("hello world");
});

// Start the server
app.listen(8086, () => {
    console.log("Server is running on port 8086");
});
