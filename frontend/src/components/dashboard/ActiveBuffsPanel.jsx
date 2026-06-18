import { useSelector } from "react-redux";
import { usePetQuery } from "../../hooks/queries/usePet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faFire } from "@fortawesome/free-solid-svg-icons";

const STREAK_TIERS = [
  { days: 30, pct: 20 },
  { days: 14, pct: 15 },
  { days: 7,  pct: 10 },
  { days: 3,  pct: 5  },
];

const STREAK_COLOR_TIERS = [
  {
    minDays: 14,
    gradient: "linear-gradient(to bottom, #D993FF, #9631DE, #7C31DE, #361A78)",
    borderColor: "rgba(150, 49, 222, 0.45)",
  },
  {
    minDays: 7,
    gradient: "linear-gradient(to bottom, #93E8FF, #31B3DE, #3176DE, #1A1F78)",
    borderColor: "rgba(49, 179, 222, 0.45)",
  },
  {
    minDays: 1,
    gradient: "linear-gradient(to bottom, #FFDA93, #DEA331, #DE6F31, #783C1A)",
    borderColor: "rgba(222, 111, 49, 0.45)",
  },
];

function getStreakBuff(streak) {
  for (const tier of STREAK_TIERS) {
    if (streak >= tier.days) return tier;
  }
  return null;
}

function getStreakColorTier(streak) {
  for (const tier of STREAK_COLOR_TIERS) {
    if (streak >= tier.minDays) return tier;
  }
  return null;
}

function StreakDots({ streak, gradient }) {
  const filled = Math.min(streak, 7);
  return (
    <div className="flex gap-1 mt-1">
      {Array.from({ length: 7 }, (_, i) => (
        <div
          key={i}
          className="w-4 h-4 rounded-full"
          style={{
            background: i < filled ? gradient : "#363669",
          }}
        />
      ))}
    </div>
  );
}

function ActiveBuffsPanel() {
  const { userData, isAuthenticated } = useSelector((state) => state.user);
  const { streakStatus }              = useSelector((state) => state.tasks);
  const { data: pet } = usePetQuery();

  const streak          = streakStatus?.currentStreak ?? userData.currentStreak ?? 0;
  const happiness       = pet?.happiness ?? 0;
  const streakBuff      = getStreakBuff(streak);
  const streakColorTier = getStreakColorTier(streak);
  const happyBuff       = happiness >= 71;
  const hasAnyBuff      = isAuthenticated && (streakBuff || happyBuff);

  return (
    <div className="rounded-3xl border-2 border-purpleNormal bg-purpleMain p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-white text-xl font-bold">Active Buffs</h2>
        {hasAnyBuff && (
          <span className="text-xs px-3 py-1 rounded-full border font-semibold tracking-widest"
            style={{ color: "#D9925A", borderColor: "#D9925A" }}>
            ACTIVE
          </span>
        )}
      </div>

      {/* Guest / no auth */}
      {!isAuthenticated && (
        <p className="text-gray-400 text-sm text-center py-6">Log in to unlock buffs</p>
      )}

      {/* No buffs yet */}
      {isAuthenticated && streak === 0 && !happyBuff && (
        <p className="text-gray-400 text-sm text-center py-6">
          Complete tasks daily to build your streak!
        </p>
      )}

      {/* Streak buff card */}
      {isAuthenticated && streak > 0 && streakColorTier && (
        <div
          className="flex items-start gap-4 p-4 rounded-2xl border-2 bg-darkBackground"
          style={{ borderColor: streakColorTier.borderColor }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: streakColorTier.gradient }}
          >
            <FontAwesomeIcon icon={faFire} className="text-white text-base" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold tracking-widest">
              {streak}-DAY STREAK
            </p>
            <StreakDots streak={streak} gradient={streakColorTier.gradient} />
            <p className="text-gray-400 text-xs mt-1">Keep it alive — don't skip a day</p>
          </div>
        </div>
      )}

      {/* Streak EXP buff card */}
      {isAuthenticated && streakBuff && (
        <div className="flex items-start gap-4 p-4 rounded-2xl border-2 border-purpleNormal bg-darkBackground">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(to bottom, #A88BFF, #5454FF)" }}
          >
            <FontAwesomeIcon icon={faBolt} className="text-white text-base" />
          </div>
          <div>
            <p className="text-white text-sm font-bold">+{streakBuff.pct}% EXP</p>
            <p className="text-xs mt-0.5" style={{ color: "#D9925A" }}>Active buff from your streak</p>
          </div>
        </div>
      )}

      {/* Happy buff card */}
      {isAuthenticated && happyBuff && (
        <div className="flex items-start gap-4 p-4 rounded-2xl border-2 border-purpleNormal bg-darkBackground">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(to bottom, #E37DDE, #B45CFF)" }}
          >
            <span className="text-white text-base">♥</span>
          </div>
          <div>
            <p className="text-white text-sm font-bold">+20% EXP</p>
            <p className="text-xs mt-0.5" style={{ color: "#D9925A" }}>Active buff from your happiness</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActiveBuffsPanel;
