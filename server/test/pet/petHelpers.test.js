const {
  applyExp,
  calcEvolutionStage,
  getStreakMultiplier,
  EXP_REWARDS,
  HAPPINESS_REWARDS,
  HAPPY_BUFF_THRESHOLD,
  HAPPY_BUFF_MULTIPLIER,
} = require("../../modules/pet/helpers");

// ── applyExp ──────────────────────────────────────────────────────────────────

describe("applyExp", () => {
  it("adds exp without levelling up", () => {
    const { newExp, newLevel, levelsGained } = applyExp(0, 0, 50);
    expect(newExp).toBe(50);
    expect(newLevel).toBe(0);
    expect(levelsGained).toBe(0);
  });

  it("levels up exactly at threshold (level 0 → 1 costs 100 EXP)", () => {
    const { newExp, newLevel, levelsGained } = applyExp(0, 0, 100);
    expect(newLevel).toBe(1);
    expect(newExp).toBe(0);
    expect(levelsGained).toBe(1);
  });

  it("carries over remainder exp after level-up", () => {
    const { newExp, newLevel } = applyExp(0, 0, 150);
    // Level 0→1 costs 100, leftover 50
    expect(newLevel).toBe(1);
    expect(newExp).toBe(50);
  });

  it("gains multiple levels in one award", () => {
    // Level 0→1: 100, 1→2: 200, total needed: 300
    const { newLevel, levelsGained } = applyExp(0, 0, 300);
    expect(newLevel).toBe(2);
    expect(levelsGained).toBe(2);
  });

  it("does not level up when exp is one short of threshold", () => {
    // Level 0→1 costs 100; give 99
    const { newLevel } = applyExp(0, 0, 99);
    expect(newLevel).toBe(0);
  });

  it("accounts for existing exp when levelling", () => {
    // Already have 90/100 needed; gain 10 → exact level-up
    const { newLevel, newExp } = applyExp(90, 0, 10);
    expect(newLevel).toBe(1);
    expect(newExp).toBe(0);
  });
});

// ── calcEvolutionStage ────────────────────────────────────────────────────────

describe("calcEvolutionStage", () => {
  it("returns 'egg' below level 5", () => {
    expect(calcEvolutionStage(0, 100)).toBe("egg");
    expect(calcEvolutionStage(4, 100)).toBe("egg");
  });

  it("returns 'baby' at level 5 regardless of happiness", () => {
    expect(calcEvolutionStage(5, 0)).toBe("baby");
    expect(calcEvolutionStage(5, 100)).toBe("baby");
  });

  it("returns 'baby' between levels 5–14", () => {
    expect(calcEvolutionStage(14, 100)).toBe("baby");
  });

  it("returns 'teen' at level 15 with happiness >= 50", () => {
    expect(calcEvolutionStage(15, 50)).toBe("teen");
    expect(calcEvolutionStage(15, 100)).toBe("teen");
  });

  it("returns 'baby' at level 15 with happiness < 50", () => {
    expect(calcEvolutionStage(15, 49)).toBe("baby");
  });

  it("returns 'adult' at level 30 with happiness >= 80", () => {
    expect(calcEvolutionStage(30, 80)).toBe("adult");
    expect(calcEvolutionStage(50, 100)).toBe("adult");
  });

  it("returns 'teen' at level 30 with happiness < 80 but >= 50", () => {
    expect(calcEvolutionStage(30, 79)).toBe("teen");
  });

  it("returns 'baby' at level 30 with happiness < 50", () => {
    expect(calcEvolutionStage(30, 49)).toBe("baby");
  });
});

// ── getStreakMultiplier ───────────────────────────────────────────────────────

describe("getStreakMultiplier", () => {
  it("returns 1.0 for streak 0", () => {
    expect(getStreakMultiplier(0)).toBe(1.0);
  });

  it("returns 1.0 for streak 2 (below first threshold)", () => {
    expect(getStreakMultiplier(2)).toBe(1.0);
  });

  it("returns 1.05 for streak 3", () => {
    expect(getStreakMultiplier(3)).toBe(1.05);
  });

  it("returns 1.05 for streak 6 (just below 7)", () => {
    expect(getStreakMultiplier(6)).toBe(1.05);
  });

  it("returns 1.10 for streak 7", () => {
    expect(getStreakMultiplier(7)).toBe(1.10);
  });

  it("returns 1.15 for streak 14", () => {
    expect(getStreakMultiplier(14)).toBe(1.15);
  });

  it("returns 1.20 for streak 30", () => {
    expect(getStreakMultiplier(30)).toBe(1.20);
  });

  it("returns 1.20 for streak > 30", () => {
    expect(getStreakMultiplier(100)).toBe(1.20);
  });
});

// ── awardTaskReward integration (pure logic, no DB) ───────────────────────────

describe("awardTaskReward pure logic", () => {
  // Simulate the reward calculation inline (service calls repo — test logic only)
  const calcAwardedExp = ({ priority, happiness, streak = 0 }) => {
    const base      = EXP_REWARDS[priority] ?? EXP_REWARDS.low;
    const happyBuff = happiness >= HAPPY_BUFF_THRESHOLD ? HAPPY_BUFF_MULTIPLIER : 1;
    const mult      = getStreakMultiplier(streak);
    return Math.floor(base * happyBuff * mult);
  };

  it("low priority, no buffs → 10 EXP", () => {
    expect(calcAwardedExp({ priority: "low", happiness: 0 })).toBe(10);
  });

  it("medium priority, no buffs → 25 EXP", () => {
    expect(calcAwardedExp({ priority: "medium", happiness: 0 })).toBe(25);
  });

  it("high priority, no buffs → 50 EXP", () => {
    expect(calcAwardedExp({ priority: "high", happiness: 0 })).toBe(50);
  });

  it("high priority + happiness buff (>= 71) → Math.floor(50 * 1.2) = 60", () => {
    expect(calcAwardedExp({ priority: "high", happiness: 71 })).toBe(60);
  });

  it("high priority + 7-day streak → Math.floor(50 * 1.1) = 55", () => {
    expect(calcAwardedExp({ priority: "high", happiness: 0, streak: 7 })).toBe(55);
  });

  it("high priority + happiness buff + 30-day streak → Math.floor(50 * 1.2 * 1.2) = 72", () => {
    expect(calcAwardedExp({ priority: "high", happiness: 71, streak: 30 })).toBe(72);
  });

  it("happiness buff does not apply below threshold (happiness 70)", () => {
    const below = calcAwardedExp({ priority: "high", happiness: 70 });
    const above = calcAwardedExp({ priority: "high", happiness: 71 });
    expect(below).toBe(50);
    expect(above).toBe(60);
  });

  it("HAPPINESS_REWARDS low/medium/high are 1/2/3", () => {
    expect(HAPPINESS_REWARDS.low).toBe(1);
    expect(HAPPINESS_REWARDS.medium).toBe(2);
    expect(HAPPINESS_REWARDS.high).toBe(3);
  });
});
