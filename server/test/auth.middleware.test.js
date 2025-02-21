const jwt = require('jsonwebtoken');
const { authOptional } = require('../middleware/authOptional');
const guestId = require('../middleware/guestId');
const User = require('../Models/User');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../Models/User');
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mock-guest-id-123')
}));

describe('Authentication and Guest System', () => {
    let mockReq;
    let mockRes;
    let nextFunction;

    beforeEach(() => {
        // จำลองข้อมูลพื้นฐานที่จำเป็นสำหรับการเทสต์
        mockReq = {
            cookies: {},
            headers: {},
            user: null
        };
        
        // จำลอง response object พร้อมฟังก์ชันต่างๆ ที่จำเป็น
        mockRes = {
            cookie: jest.fn(),
            clearCookie: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        
        nextFunction = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Guest System', () => {
        test('should create new guestId for first-time visitors', async () => {
            // เทสต์กรณีผู้ใช้เข้ามาครั้งแรก ยังไม่มี guestId
            await guestId(mockReq, mockRes, nextFunction);

            // ตรวจสอบว่ามีการสร้าง guestId ใหม่
            expect(mockRes.cookie).toHaveBeenCalledWith(
                'guestId',
                'mock-guest-id-123',
                expect.objectContaining({
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None'
                })
            );
            expect(mockReq.guestId).toBe('mock-guest-id-123');
            expect(nextFunction).toHaveBeenCalled();
        });

        test('should reuse existing guestId from cookies', async () => {
            // จำลองกรณีที่มี guestId อยู่แล้วใน cookie
            mockReq.cookies.guestId = 'existing-guest-id';
            
            await guestId(mockReq, mockRes, nextFunction);

            // ตรวจสอบว่าใช้ guestId เดิม
            expect(mockRes.cookie).not.toHaveBeenCalled();
            expect(mockReq.guestId).toBe('existing-guest-id');
            expect(nextFunction).toHaveBeenCalled();
        });

        test('should not set guestId for logged-in users', async () => {
            // จำลองกรณีที่ user login แล้ว
            mockReq.user = { id: 'user123' };
            
            await guestId(mockReq, mockRes, nextFunction);

            // ตรวจสอบว่าไม่มีการตั้งค่า guestId
            expect(mockReq.guestId).toBeNull();
            expect(mockRes.cookie).not.toHaveBeenCalled();
            expect(nextFunction).toHaveBeenCalled();
        });
    });

    describe('Authentication System', () => {
        test('should handle transition from guest to authenticated user', async () => {
            // จำลองการเปลี่ยนจาก guest เป็น user ที่ login แล้ว
            
            // 1. เริ่มต้นเป็น guest
            mockReq.cookies.guestId = 'existing-guest-id';
            await guestId(mockReq, mockRes, nextFunction);
            expect(mockReq.guestId).toBe('existing-guest-id');

            // 2. จำลองการ login
            mockReq.user = { id: 'user123' };
            await guestId(mockReq, mockRes, nextFunction);
            
            // ตรวจสอบว่า guestId ถูกล้าง
            expect(mockReq.guestId).toBeNull();
        });

        test('should handle auth token refresh with guest state preserved', async () => {
            // จำลองกรณีที่ token ต้อง refresh แต่ยังเป็น guest
            const mockAccessToken = 'mock.access.token';
            mockReq.cookies = {
                accessToken: mockAccessToken,
                guestId: 'existing-guest-id'
            };

            // จำลอง token ที่ใกล้หมดอายุ
            jwt.verify.mockImplementationOnce(() => ({
                exp: (Date.now() + 4 * 60 * 1000) / 1000
            }));

            // เรียกใช้ทั้งสอง middleware
            const authMiddleware = authOptional(true);
            await authMiddleware(mockReq, mockRes, nextFunction);
            await guestId(mockReq, mockRes, nextFunction);

            // ตรวจสอบว่า guestId ยังคงอยู่
            expect(mockReq.guestId).toBe('existing-guest-id');
        });
    });

    describe('Error Handling', () => {
        test('should handle guest middleware errors gracefully', async () => {
            // จำลองข้อผิดพลาด
            mockReq.cookies = null; // สร้างสถานการณ์ที่จะทำให้เกิด error

            await guestId(mockReq, mockRes, nextFunction);

            // ตรวจสอบว่า error ถูกส่งไปที่ next function
            expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
        });
    });
});