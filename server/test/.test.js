const {
  updateUserStreak,
  calculateBadge,
} = require("../controllers/helperController");
const User = require("../Models/User");
const { resetDailyStreakStatus } = require("../job/cronJob");
const { startOfDay, subDays } = require("date-fns");

jest.mock("../Models/User"); // Mocking User model
jest.mock("../controllers/helperController", () => {
  const actualModule = jest.requireActual("../controllers/helperController");
  return {
    ...actualModule,
    calculateBadge: jest.fn(), // Mock calculateBadge
  };
});

describe("updateUserStreak", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should not update streak if already completed today", async () => {
    const mockUser = {
      _id: "123",
      currentStreak: 5,
      alreadyCompletedToday: true,
      lastCompleted: new Date(),
      bestStreak: 5,
      currentBadge: "silver",
      save: jest.fn(),
    };

    User.findById.mockResolvedValue(mockUser);

    const result = await updateUserStreak("123", true);

    expect(result.alreadyCompletedToday).toBe(true); // ยืนยันว่า completed แล้ว
    expect(mockUser.save).not.toHaveBeenCalled(); // ไม่ควรเรียก save
  });

  it("should start a new streak when there is no previous completion", async () => {
    const mockUser = {
      _id: "123",
      currentStreak: 0,
      alreadyCompletedToday: false,
      lastCompleted: null,
      bestStreak: 0,
      currentBadge: "iron",
      save: jest.fn(),
    };

    User.findById.mockResolvedValue(mockUser);

    const result = await updateUserStreak("123", true);

    expect(result.currentStreak).toBe(1);
    expect(result.alreadyCompletedToday).toBe(true);
    expect(mockUser.save).toHaveBeenCalled();
  });

  it("should increment streak if last completion was yesterday", async () => {
    const yesterday = startOfDay(subDays(new Date(),1));
    

    const mockUser = {
      _id: "123",
      currentStreak: 3,
      lastCompleted: yesterday,
      alreadyCompletedToday: false,
      bestStreak: 10,
      currentBadge: "bronze",
      save: jest.fn(),
    };

    User.findById.mockResolvedValue(mockUser);

    const result = await updateUserStreak("123", true);

    expect(result.currentStreak).toBe(4);
    expect(result.bestStreak).toBe(10);
    expect(result.alreadyCompletedToday).toBe(true);
    expect(mockUser.save).toHaveBeenCalled();
  });

  
  it("should update badge if streak qualifies for a new badge", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const mockUser = {
      _id: "123",
      currentStreak: 10,
      alreadyCompletedToday: false,
      lastCompleted: yesterday,
      bestStreak: 15,
      currentBadge: "bronze",
      save: jest.fn(),
    };

    // Mock User.findById ให้คืนค่า mockUser
    User.findById.mockResolvedValue(mockUser);

    // Mock calculateBadge ให้คืนค่า 'silver' เมื่อ streak = 11
    calculateBadge.mockReturnValueOnce("silver");

    // เรียกใช้งานฟังก์ชัน
    const result = await updateUserStreak("123", true);

    // การตรวจสอบ
    expect(result.oldBadge).toBe("bronze");
    expect(result.currentStreak).toBe(11);
    expect(result.newBadge).toBe("silver");
    expect(result.badgeChange).toBe(true);
    expect(mockUser.currentBadge).toBe("silver");
    expect(mockUser.save).toHaveBeenCalled();
  });

  it("should handle already completed today", async () => {
    const today = new Date();

    const mockUser = {
      _id: "123",
      currentStreak: 5,
      alreadyCompletedToday: true,
      lastCompleted: today,
      bestStreak: 5,
      currentBadge: "silver",
      save: jest.fn(),
    };

    User.findById.mockResolvedValue(mockUser);

    const result = await updateUserStreak("123", true);

    expect(result.alreadyCompletedToday).toBe(true);
    expect(result.currentStreak).toBe(5);
    expect(mockUser.save).not.toHaveBeenCalled();
  });
});

describe('resetDailyStreakStatus', () => {
  it('should reset streak and alreadyCompletedToday for users with broken streak', async () => {
    const mockUsers = [
      { 
        _id: 1, 
        lastCompleted: new Date('2024-12-03'), 
        currentStreak: 5, 
        alreadyCompletedToday: true, 
        save: jest.fn().mockResolvedValue(true) // Mock save function
      },
      { 
        _id: 2, 
        lastCompleted: new Date('2024-12-02'), 
        currentStreak: 3, 
        alreadyCompletedToday: true, 
        save: jest.fn().mockResolvedValue(true) // Mock save function
      },
    ];

    // Mock `User.find` to return mock users
    User.find.mockResolvedValue(mockUsers);

    await resetDailyStreakStatus();

    // Check if streak is reset for users with broken streak
    expect(mockUsers[0].currentStreak).toBe(0); // Should reset streak for user 1
    expect(mockUsers[1].currentStreak).toBe(0); // Should reset streak for user 2
    expect(mockUsers[0].save).toHaveBeenCalled(); // Ensure save is called for user 1
    expect(mockUsers[1].save).toHaveBeenCalled(); // Ensure save is called for user 2

    // Check if `alreadyCompletedToday` is reset
    expect(mockUsers[0].alreadyCompletedToday).toBe(false);
    expect(mockUsers[1].alreadyCompletedToday).toBe(false);

    // Check if `User.updateMany` was called to reset all `alreadyCompletedToday` fields
    expect(User.updateMany).toHaveBeenCalledWith(
      { alreadyCompletedToday: true },
      { alreadyCompletedToday: false }
    );
  });

  it('should handle errors gracefully', async () => {
    User.find.mockRejectedValue(new Error('Database error'));

    await expect(resetDailyStreakStatus()).rejects.toThrow('Error resetting alreadyCompletedToday: Database error');
  });
});