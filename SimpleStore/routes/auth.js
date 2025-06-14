const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const pool = require('../config/database');

const router = express.Router();


router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];

        const isvalidPassword = await bcrypt.compare(password, user.password);

        if (!isvalidPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = generateToken(user.id, user.username, user.role);
        res.json({ token });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role = 'user' } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email and password are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query('INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *', [username, email, hashedPassword, role]);

        res.status(201).json({
            message: 'User created successfully',
            user: newUser.rows[0]
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'User already exists' });
        } else {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
});

module.exports = router;
