const express = require('express');
const pool = require('../config/database');
const authenticateJWT = require('../middleware/authenticateJWT');
const authorizeRole = require('../middleware/authorizeRole');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/', authenticateJWT, authorizeRole('admin'), async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        if (!name || !price) {
            return res.status(400).json({ message: 'Name and price are required' });
        }

        const result = await pool.query(
            'INSERT INTO products (name, description, price, category, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, description, price, category, stock]
        );

        res.status(201).json({
            message: 'Product created successfully',
            product: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/:id', authenticateJWT, authorizeRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, stock } = req.body;

        const result = await pool.query(
            'UPDATE products SET name = $1, description = $2, price = $3, category = $4, stock = $5 WHERE id = $6 RETURNING *',
            [name, description, price, category, stock, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        res.status(200).json({
            message: 'Product updated successfully',
            product: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/:id', authenticateJWT, authorizeRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        res.status(200).json({
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
