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

    test('should refresh token when close to expiry', async () => {
        req.cookies.accessToken = 'valid-token';
        req.cookies.refreshToken = 'refresh-token';

        jwt.verify.mockImplementation(() => ({
            userId: 'user-123',
            exp: (Date.now() + 1 * 60 * 1000) / 1000 // 1 minute to expire
        }));

        User.findById.mockResolvedValue({ _id: 'user-123' });

        const middleware = authMiddlewareOptional(false);
        await middleware(req, res, next);

        expect(res.cookie).toHaveBeenCalledWith(
            'accessToken',
            expect.any(String),
            expect.any(Object)
        );
    });
});