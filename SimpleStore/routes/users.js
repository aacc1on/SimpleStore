const express = require('express');
const pool = require('../config/database');
const authenticateJWT = require('../middleware/authenticateJWT');
const authhorizeRole = require('../middleware/authorizeRole');
const authorizeRole = require('../middleware/authorizeRole');

const router = express.Router();

router.get('/', authenticateJWT, authorizeRole('admin'), async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Users not found' });
        }
        res.status(200).json(result.rows);

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:id', authenticateJWT, authhorizeRole('admin'), async (req, res) => {
    try {
        const { id }  = req.params;
        const result = await pool.query('SELECT FROM users WHERE if = $1', [id]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/profile', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log(userId);
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        
        if(result.length === 0){
            return res.status(404).json({ message: 'User not found' });
        };
        res.status(200).json(result.rows[0]);
        
    }catch(error){
        res.status(500).json({ message: 'Internal server error' });
    }

});

router.put('/:id', authenticateJWT, authhorizeRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        const result = await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
            [role, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({
            message: 'User updated successfully',
            user: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });


    }
});

module.exports = router;
