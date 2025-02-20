const jwt = require('jsonwebtoken');
const { promisify } = require('util')

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

const jwtVerify = promisify(jwt.verify);

const authMiddlewareOptional = (allowGuest = false) => async (req, res, next) => {
    console.log('Full Cookies:', req.cookies);
    console.log('Access Token from headers:', req.headers.authorization);
    const token = req.cookies.accessToken ||  req.headers.authorization?.split(' ')[1];

    if (!token) {
        console.log('req.cookies.guestId',req.cookies.guestId)

        if(allowGuest && req.cookies.guestId){
            req.user = null;
            req.guestId = req.cookies.guestId;
            console.log('Guest ID from cookies:',req.guestId);
           return next();
        } else{
            console.log('No accessToken found in cookies.');
            req.user = null;
            return next();
        }
    }

    try {
        const decoded = await jwtVerify(token, accessTokenSecret);

        if (Date.now() >= decoded.exp * 1000) {
            req.user = null
            next();
        }

        req.user = { id: decoded.userId };

        if (decoded.exp * 1000 - Date.now() < 15 * 60 * 1000) {
            const newToken = jwt.sign({ userId: decoded.userId }, accessTokenSecret, { expiresIn: '1h' });
            res.cookie('accessToken', newToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                maxAge: 360000, // 1 hour
            });
        }

        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        req.user = null
        next();
    }
};

module.exports = authMiddlewareOptional;