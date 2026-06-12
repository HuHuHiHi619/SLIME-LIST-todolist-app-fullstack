const petService = require("./service");
const User = require("../../Models/User");

const getPet = async (req, res) => {
  try {
    const userId  = req.user?.id;
    const guestId = req.guestId;
    const pet = await petService.getPet({ userId, guestId });
    res.json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const completePomodoro = async (req, res) => {
  try {
    const userId  = req.user?.id;
    const guestId = req.guestId;

    let currentStreak = 0;
    if (userId) {
      const user = await User.findById(userId).select("currentStreak").lean();
      currentStreak = user?.currentStreak ?? 0;
    }

    const result = await petService.awardPomodoroReward({ userId, guestId, currentStreak });
    res.json(result);
  } catch (err) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
};

module.exports = { getPet, completePomodoro };
