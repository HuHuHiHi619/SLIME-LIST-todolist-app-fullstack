const jwt = require('jsonwebtoken');

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

const authMiddleware = (req,res,next) => {
    const authHeader = req.headers['authorization'];
    
    if(!authHeader){
        return res.status(401).json({error:'No token, authorization denied'});
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7, authHeader.length) : authHeader;
    console.log('Receive token:',token);
   
    try{
        const decoded = jwt.verify(token,accessTokenSecret);
        req.user = {id: decoded.userId};
        console.log('Decoded token:', decoded);
        next();
    } catch(error){
        console.error('Token verification error',error.message);
        res.status(401).json({error:'Token is not valid'})
    }
} 

module.exports = authMiddleware;