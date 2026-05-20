const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const authMiddlewareOptional = require('../middleware/authOptional');

jest.mock('jsonwebtoken');
jest.mock('../Models/User');

describe('Auth Middleware Optional', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {
            cookies: {},
            headers: {}
        };
        res = {
            cookie: jest.fn(),
            clearCookie: jest.fn()
        };
        next = jest.fn();
    });

    test('should handle guest users', async () => {
        req.cookies.guestId = 'guest-123';
        const middleware = authMiddlewareOptional(true);
        
        await middleware(req, res, next);
        
        expect(req.user).toBeNull();
        expect(req.guestId).toBe('guest-123');
        expect(next).toHaveBeenCalled();
    });

    test('should set req.user and call next when token is valid', async () => {
        req.cookies.accessToken = 'valid-token';

        // authOptional uses promisify(jwt.verify), so the mock must be callback-style.
        // A synchronous return never invokes the callback → Promise hangs → timeout.
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, { userId: 'user-123' });
        });

        const middleware = authMiddlewareOptional(false);
        await middleware(req, res, next);

        expect(req.user).toEqual({ id: 'user-123' });
        expect(next).toHaveBeenCalled();
    });

    test('should clear accessToken cookie and call next when token is expired', async () => {
        req.cookies.accessToken = 'expired-token';

        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(new Error('TokenExpiredError'), null);
        });

        const middleware = authMiddlewareOptional(false);
        await middleware(req, res, next);

        expect(req.user).toBeNull();
        expect(res.clearCookie).toHaveBeenCalledWith('accessToken', expect.any(Object));
        expect(next).toHaveBeenCalled();
    });
});