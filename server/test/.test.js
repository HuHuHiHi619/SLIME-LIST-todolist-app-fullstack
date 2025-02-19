const {
  updateUserStreak,
  calculateBadge,
} = require("../controllers/helperController");
const User = require("../Models/User");
const { resetDailyStreakStatus } = require("../job/cronJob");
const { startOfDay, subDays, differenceInDays } = require("date-fns");

jest.mock("../Models/User");
jest.mock("../controllers/helperController", () => {
  const actualModule = jest.requireActual("../controllers/helperController");
  return {
    ...actualModule,
    calculateBadge: jest.fn(),
  };
});

describe("updateUserStreak", () => {
  let mockConsole;
  
  beforeEach(() => {
    // Mock console logs for testing
    mockConsole = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockConsole.log.mockRestore();
    mockConsole.error.mockRestore();
  });

  it("should not update streak if already completed today", async () => {
    const currentDate = startOfDay(new Date());
    const mockUser = {
      _id: "123",
      currentStreak: 5,
      alreadyCompletedToday: true,
      lastCompleted: currentDate,
      bestStreak: 5,
      currentBadge: "silver",
      save: jest.fn(),
    };

    User.findById.mockResolvedValue(mockUser);
    const result = await updateUserStreak("123", true);

    expect(result.currentStreak).toBe(5);
    expect(result.alreadyCompletedToday).toBe(true);
    expect(mockConsole.log).toHaveBeenCalledWith("Already completed today, no streak update needed");
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
    expect(result.bestStreak).toBe(1);
    expect(mockUser.save).toHaveBeenCalled();
    expect(mockConsole.log).toHaveBeenCalledWith("Starting new streak");
  });

  it("should increment streak if last completion was yesterday", async () => {
    const currentDate = startOfDay(new Date());
    const yesterday = startOfDay(subDays(currentDate, 1));
    
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
    expect(mockConsole.log).toHaveBeenCalledWith("Continuing streak");
  });

  it("should maintain streak if completing another task on the same day", async () => {
    const currentDate = startOfDay(new Date());
    const mockUser = {
      _id: "123",
      currentStreak: 5,
      lastCompleted: currentDate,
      alreadyCompletedToday: false,
      bestStreak: 5,
      currentBadge: "bronze",
      save: jest.fn(),
    };

    User.findById.mockResolvedValue(mockUser);
    const result = await updateUserStreak("123", true);

    expect(result.currentStreak).toBe(5); // Streak should remain the same
    expect(result.alreadyCompletedToday).toBe(true);
    expect(mockUser.save).toHaveBeenCalled();
    
  });

  it("should reset streak if more than one day has passed", async () => {
    const currentDate = startOfDay(new Date());
    const twoDaysAgo = startOfDay(subDays(currentDate, 2));
    
    const mockUser = {
      _id: "123",
      currentStreak: 5,
      lastCompleted: twoDaysAgo,
      alreadyCompletedToday: false,
      bestStreak: 10,
      currentBadge: "bronze",
      save: jest.fn(),
    };

    User.findById.mockResolvedValue(mockUser);
    const result = await updateUserStreak("123", true);

    expect(result.currentStreak).toBe(1); // Reset to 1
    expect(result.bestStreak).toBe(10); // Best streak remains
    expect(result.alreadyCompletedToday).toBe(true);
    expect(mockUser.save).toHaveBeenCalled();
    expect(mockConsole.log).toHaveBeenCalledWith("Starting new streak");
  });

  it("should update badge if streak qualifies for a new badge", async () => {
    const yesterday = startOfDay(subDays(new Date(), 1));
    const mockUser = {
      _id: "123",
      currentStreak: 4,
      alreadyCompletedToday: false,
      lastCompleted: yesterday,
      bestStreak: 15,
      currentBadge: "iron",
      save: jest.fn(),
    };

    User.findById.mockResolvedValue(mockUser);
    calculateBadge.mockReturnValueOnce("bronze");

    const result = await updateUserStreak("123", true);

    expect(result.oldBadge).toBe("iron");
    expect(result.currentStreak).toBe(5);
    expect(result.newBadge).toBe("bronze");
    expect(result.badgeChange).toBe(true);
    expect(mockUser.currentBadge).toBe("bronze");
    expect(mockUser.save).toHaveBeenCalled();
    expect(mockConsole.log).toHaveBeenCalledWith("Badge updated:", "iron", "->", "bronze");
  });
});

describe('resetDailyStreakStatus', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  it('should reset streak and alreadyCompletedToday for users with broken streak', async () => {
    const twoDaysAgo = startOfDay(subDays(new Date(), 2));
    const mockUsers = [
      { 
        _id: 1, 
        lastCompleted: twoDaysAgo,
        currentStreak: 5, 
        alreadyCompletedToday: true, 
        save: jest.fn().mockResolvedValue(true)
      },
      { 
        _id: 2, 
        lastCompleted: twoDaysAgo,
        currentStreak: 3, 
        alreadyCompletedToday: true, 
        save: jest.fn().mockResolvedValue(true)
      },
    ];

    User.find.mockResolvedValue(mockUsers);

    await resetDailyStreakStatus();

    expect(mockUsers[0].currentStreak).toBe(0);
    expect(mockUsers[1].currentStreak).toBe(0);
    expect(mockUsers[0].save).toHaveBeenCalled();
    expect(mockUsers[1].save).toHaveBeenCalled();
    expect(mockUsers[0].alreadyCompletedToday).toBe(false);
    expect(mockUsers[1].alreadyCompletedToday).toBe(false);

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