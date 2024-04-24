const path = require('path');
console.log("Attempting to load .env from:", path.resolve(__dirname, '../.env'));

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const dbPool = require('./config'); // Ensure this path is correct
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running successfully.');
});

app.post('/api/accounts/create', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).send({ message: "All fields are required: username, email, and password." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const conn = await dbPool.getConnection();
        const insertQuery = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        await conn.query(insertQuery, [username, email, hashedPassword]);
        res.status(201).send({ message: "Account created successfully." });
    } catch (err) {
        console.error('Error creating user:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).send({ message: "Username or email is already taken." });
        }
        res.status(500).send({ message: "Error creating account." });
    } finally {
        if (conn) conn.release();
    }
});

const jwt = require('jsonwebtoken');

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send({ message: "Username and password are required" });
    }

    let conn;
    try {
        conn = await dbPool.getConnection();
        const users = await conn.query("SELECT * FROM users WHERE username = ?", [username]);
        if (conn) conn.release();

        if (users.length === 0) {
            return res.status(401).send({ message: "Invalid username or password" });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).send({ message: "Invalid username or password" });
        }

        if (!process.env.JWT_SECRET_KEY) {
            console.error('JWT secret key is not set.');
            return res.status(500).send({ message: "Server error" });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '24h' }
        );

        res.json({ token, message: "Logged in successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Error logging in" });
    }
});


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
  
    if (!token) return res.sendStatus(401); 
  
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (!token) return res.status(401).json({ message: "No token provided" });
      if (err) return res.sendStatus(403); 
      req.user = user; 
      next();
    });
  };

app.post('/api/password/add', authenticateToken, async (req, res) => {
    const { service_name, username, password } = req.body;
    const userId = req.user.userId;
    const encryptionKey = crypto.createHash('sha256').update(process.env.ENCRYPTION_SECRET_KEY).digest().slice(0, 16);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-128-cbc', encryptionKey, iv);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
  
    let conn;
    try {
        conn = await dbPool.getConnection();
        await conn.query("INSERT INTO user_passwords (user_id, service_name, username, encrypted_password, iv) VALUES (?, ?, ?, ?, ?)", [userId, service_name, username, encrypted, iv.toString('hex')]);
        res.send({ message: "Password added successfully" });
    } catch (err) {
        console.error("Error adding password:", err);
        res.status(500).send({ message: "Error adding password" });
    } finally {
        if (conn) conn.release();
    }
});

app.get('/api/passwords', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    let conn;
    try {
        conn = await dbPool.getConnection();
        const result = await conn.query("SELECT id, service_name, username, encrypted_password, iv FROM user_passwords WHERE user_id = ?", [userId]);
        const passwordEntries = result.rows ? result.rows : result;

        if (!Array.isArray(passwordEntries) || passwordEntries.length === 0) {
            return res.status(404).json({ message: "No passwords found." });
        }

        const encryptionKey = crypto.createHash('sha256').update(process.env.ENCRYPTION_SECRET_KEY).digest().slice(0, 16);
        const decryptedPasswords = passwordEntries.map(entry => {
            try {
                const ivBuffer = Buffer.from(entry.iv, 'hex');
                const decipher = crypto.createDecipheriv('aes-128-cbc', encryptionKey, ivBuffer);
                let decryptedPassword = decipher.update(entry.encrypted_password, 'hex', 'utf8');
                decryptedPassword += decipher.final('utf8');

                return {
                    id: entry.id,
                    service_name: entry.service_name,
                    username: entry.username,
                    password: decryptedPassword
                };
            } catch (decryptionError) {
                console.error("Decryption error:", decryptionError);
                return null;
            }
        }).filter(entry => entry !== null);

        res.json(decryptedPasswords);
    } catch (err) {
        console.error("Error fetching stored passwords:", err);
        res.status(500).send({ message: "Error fetching stored passwords" });
    } finally {
        if (conn && conn.release) conn.release();
    }
});

app.delete('/api/passwords/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    let conn;
    try {
        conn = await dbPool.getConnection();
        const result = await conn.query("DELETE FROM user_passwords WHERE id = ? AND user_id = ?", [id, userId]);
        if (result.affectedRows) {
            res.json({ message: 'Password deleted successfully' });
        } else {
            res.status(404).json({ message: 'Password not found' });
        }
    } catch (error) {
        console.error("Error deleting password:", error);
        res.status(500).send({ message: "Failed to delete password" });
    } finally {
        if (conn) conn.release();
    }
});

app.put('/api/passwords/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { service_name, username, newPassword } = req.body;
    const userId = req.user.userId;

    if (!service_name || !username || !newPassword) {
        return res.status(400).json({ message: 'All fields are required: service_name, username, and password.' });
    }

    let conn;
    try {
        conn = await dbPool.getConnection();
        const newIv = crypto.randomBytes(16);
        const encryptionKey = crypto.createHash('sha256').update(process.env.ENCRYPTION_SECRET_KEY).digest().slice(0, 16);
        const cipher = crypto.createCipheriv('aes-128-cbc', encryptionKey, newIv);
        let encryptedPassword = cipher.update(newPassword, 'utf8', 'hex');
        encryptedPassword += cipher.final('hex');

        const result = await conn.query("UPDATE user_passwords SET service_name = ?, username = ?, encrypted_password = ?, iv = ? WHERE id = ? AND user_id = ?", 
            [service_name, username, encryptedPassword, newIv.toString('hex'), id, userId]);

        if (result.affectedRows) {
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(404).json({ message: 'Password not found' });
        }
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).send({ message: "Failed to update password" });
    } finally {
        if (conn) conn.release();
    }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const username = req.user.username;

    console.log("Extracted from token - userId:", userId, "username:", username);

    let conn;
    try {
        conn = await dbPool.getConnection();
        
        const result = await conn.query("SELECT id, username, email FROM users WHERE id = ? AND username = ?", [userId, username]);
        console.log("Full query result:", result);
        
        
        const userData = result[0];
        
        console.log("userData before check:", userData); 

        if (userData) {
            console.log("User data:", userData);
            res.json(userData); // Send user data as JSON
        } else {
            console.log("No user found with the provided userId and username");
            return res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching user data" });
    } finally {
        if (conn) conn.release();
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
