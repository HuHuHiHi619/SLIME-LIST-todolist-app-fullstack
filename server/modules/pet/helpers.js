const EXP_REWARDS      = { low: 10, medium: 25, high: 50 };
const HAPPINESS_REWARDS  = { low: 1,  medium: 2,  high: 3  };
const HAPPY_BUFF_THRESHOLD  = 71;
const HAPPY_BUFF_MULTIPLIER = 1.2;

const getStreakMultiplier = (streak) => {
  if (streak >= 30) return 1.20;
  if (streak >= 14) return 1.15;
  if (streak >= 7)  return 1.10;
  if (streak >= 3)  return 1.05;
  return 1.0;
};

const calcEvolutionStage = (level, happiness) => {
  if (level >= 30 && happiness >= 80) return "adult";
  if (level >= 15 && happiness >= 50) return "teen";
  if (level >= 5)                     return "baby";
  return "egg";
};

// Level N costs N*100 EXP to complete — returns { newExp, newLevel, levelsGained }
const applyExp = (currentExp, currentLevel, gained) => {
  let exp   = currentExp + gained;
  let level = currentLevel;
  let levelsGained = 0;
  while (exp >= (level + 1) * 100) {
    exp -= (level + 1) * 100;
    level += 1;
    levelsGained += 1;
  }
  return { newExp: exp, newLevel: level, levelsGained };
};

module.exports = {
  EXP_REWARDS,
  HAPPINESS_REWARDS,
  HAPPY_BUFF_THRESHOLD,
  HAPPY_BUFF_MULTIPLIER,
  getStreakMultiplier,
  calcEvolutionStage,
  applyExp,
};
