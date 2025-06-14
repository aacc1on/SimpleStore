const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user'
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        stock INTEGER DEFAULT 0
      )
    `);

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO users (username, email, password, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) DO NOTHING
    `, ['admin', 'admin@example.com', hashedPassword, 'admin']);

    const sampleProducts = [
      { name: 'Laptop', description: 'High-performance laptop', price: 999.99, category: 'Electronics', stock: 10 },
      { name: 'Smartphone', description: 'Latest smartphone', price: 699.99, category: 'Electronics', stock: 25 },
      { name: 'Coffee Mug', description: 'Ceramic coffee mug', price: 12.99, category: 'Home', stock: 50 }
    ];

    for (const product of sampleProducts) {
      await pool.query(`
        INSERT INTO products (name, description, price, category, stock)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [product.name, product.description, product.price, product.category, product.stock]);
    }

    console.log('Database initialized successfully!');
    console.log('Default admin user created: username=admin, password=admin123');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await pool.end();
  }
}

initDatabase();
