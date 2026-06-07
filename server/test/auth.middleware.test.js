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
            clearCookie: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    test('should set req.user to null and call next when no token present', async () => {
        req.cookies.guestId = 'guest-123';
        const middleware = authMiddlewareOptional(true);

        await middleware(req, res, next);

        expect(req.user).toBeNull();
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

    test('should clear accessToken cookie and return 401 when token is expired (allowGuest=false)', async () => {
        req.cookies.accessToken = 'expired-token';

        const expiredError = new Error('jwt expired');
        expiredError.name = 'TokenExpiredError';
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(expiredError, null);
        });

        const middleware = authMiddlewareOptional(false);
        await middleware(req, res, next);

        expect(req.user).toBeNull();
        expect(res.clearCookie).toHaveBeenCalledWith('accessToken', expect.any(Object));
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    test('should not clear cookie and return 401 when token is invalid (allowGuest=false)', async () => {
        req.cookies.accessToken = 'malformed-token';

        const invalidError = new Error('invalid signature');
        invalidError.name = 'JsonWebTokenError';
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(invalidError, null);
        });

        const middleware = authMiddlewareOptional(false);
        await middleware(req, res, next);

        expect(req.user).toBeNull();
        expect(res.clearCookie).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
});