const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (userid, username, role) =>{
    return jwt.sign(
        {
            userid,
            username,
            role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '1d'
        }
    );
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
    generateToken,
    verifyToken
};