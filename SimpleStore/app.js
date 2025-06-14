const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
dotenv.config();

const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const productRouter = require('./routes/products');


const app = express();

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080']
}));

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);

app.get('/', (req, res) => {
    res.json({
        message: 'SimpleStore API',
        endpoint: {
            auth: '/api/auth',
            users: '/api/users',
            products: '/api/products'
        }
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message
    });
});

app.use((req, res) => {
    res.status(404).json({
        message: 'Not found'
    });
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

// module.exports = app;

