const {verifyToken} = require('../utils/jwt');

const autenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({message: 'Unauthorized'});
    }

    const token = authHeader.split(' ')[1];
    try{
        const decoded = await verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({message: 'Forbidden'});
    }

};

module.exports = autenticateJWT;



