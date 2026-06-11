const repo = require("./repository");
const {
  EXP_REWARDS,
  HAPPINESS_REWARDS,
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

module.exports = { getPet, awardTaskReward };
