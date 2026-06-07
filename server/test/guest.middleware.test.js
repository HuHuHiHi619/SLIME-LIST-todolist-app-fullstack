const guestMiddleware = require('../middleware/guestId');

describe('guestMiddleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { cookies: {}, user: null };
    res = {
      cookie: jest.fn(),
    };
    next = jest.fn();
  });

  test('should error if req.user is undefined (no auth middleware upstream)', () => {
    req.user = undefined;
    guestMiddleware(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toMatch(/auth middleware/);
  });

  test('should accept a valid UUID guestId cookie', () => {
    req.cookies.guestId = '550e8400-e29b-41d4-a716-446655440000';
    guestMiddleware(req, res, next);
    expect(req.guestId).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(res.cookie).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  test('should reject an invalid guestId cookie and generate a fresh UUID', () => {
    req.cookies.guestId = 'not-a-uuid';
    guestMiddleware(req, res, next);
    expect(req.guestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(res.cookie).toHaveBeenCalledWith('guestId', req.guestId, expect.any(Object));
    expect(next).toHaveBeenCalledWith();
  });

  test('should generate a new guestId when no cookie is present', () => {
    guestMiddleware(req, res, next);
    expect(req.guestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(res.cookie).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  test('should set req.guestId to null when user is logged in', () => {
    req.user = { id: 'user-123' };
    guestMiddleware(req, res, next);
    expect(req.guestId).toBeNull();
    expect(res.cookie).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });
});
