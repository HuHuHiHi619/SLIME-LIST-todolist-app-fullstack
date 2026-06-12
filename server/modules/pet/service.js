const repo = require("./repository");
const {
  EXP_REWARDS,
  HAPPINESS_REWARDS,
  POMODORO_EXP,
  POMODORO_HAPPINESS,
  POMODORO_COOLDOWN_MS,
  HAPPY_BUFF_THRESHOLD,
  HAPPY_BUFF_MULTIPLIER,
  getStreakMultiplier,
  calcEvolutionStage,
  applyExp,
} = require("./helpers");

const getPet = async ({ userId, guestId }) => {
  if (!userId && !guestId) throw new Error("userId or guestId required");
  const find   = userId  ? () => repo.findByUser(userId)    : () => repo.findByGuest(guestId);
  const create = userId  ? () => repo.createForUser(userId) : () => repo.createForGuest(guestId);
  try {
    return (await find()) ?? (await create());
  } catch (err) {
    if (err.code === 11000) return find();
    throw err;
  }
};

const awardTaskReward = async ({ userId, guestId, priority, currentStreak = 0 }) => {
  const pet = await getPet({ userId, guestId });

  const baseExp       = EXP_REWARDS[priority]      ?? EXP_REWARDS.low;
  const happinessGain = HAPPINESS_REWARDS[priority] ?? HAPPINESS_REWARDS.low;
  const happyBuff     = pet.happiness >= HAPPY_BUFF_THRESHOLD ? HAPPY_BUFF_MULTIPLIER : 1;
  const streakMult    = getStreakMultiplier(currentStreak);
  const awardedExp    = Math.floor(baseExp * happyBuff * streakMult);

  const { newExp, newLevel, levelsGained } = applyExp(pet.exp, pet.level, awardedExp);

  pet.exp            = newExp;
  pet.level          = newLevel;
  pet.happiness      = Math.min(100, pet.happiness + happinessGain);
  pet.evolutionStage = calcEvolutionStage(pet.level, pet.happiness);

  await repo.save(pet);
  return { pet, awardedExp, levelsGained };
};

const awardPomodoroReward = async ({ userId, guestId, currentStreak = 0 }) => {
  const pet = await getPet({ userId, guestId });

  if (pet.lastPomodoroAt && Date.now() - pet.lastPomodoroAt.getTime() < POMODORO_COOLDOWN_MS) {
    const err = new Error("Pomodoro cooldown active");
    err.status = 429;
    throw err;
  }

  const happyBuff  = pet.happiness >= HAPPY_BUFF_THRESHOLD ? HAPPY_BUFF_MULTIPLIER : 1;
  const streakMult = getStreakMultiplier(currentStreak);
  const awardedExp = Math.floor(POMODORO_EXP * happyBuff * streakMult);

  const { newExp, newLevel, levelsGained } = applyExp(pet.exp, pet.level, awardedExp);

  pet.exp            = newExp;
  pet.level          = newLevel;
  pet.happiness      = Math.min(100, pet.happiness + POMODORO_HAPPINESS);
  pet.evolutionStage = calcEvolutionStage(pet.level, pet.happiness);
  pet.pomodorosToday = (pet.pomodorosToday ?? 0) + 1;
  pet.lastPomodoroAt = new Date();

  await repo.save(pet);
  return { pet, awardedExp, levelsGained };
};

module.exports = { getPet, awardTaskReward, awardPomodoroReward };
