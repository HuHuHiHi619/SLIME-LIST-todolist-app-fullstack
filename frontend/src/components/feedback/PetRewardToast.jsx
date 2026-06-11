import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearLastReward } from "../../redux/petSlice";

const AUTO_DISMISS_MS = 3000;

const PetRewardToast = () => {
  const lastReward = useSelector((state) => state.pet.lastReward);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!lastReward) return;
    const id = setTimeout(() => dispatch(clearLastReward()), AUTO_DISMISS_MS);
    return () => clearTimeout(id);
  }, [lastReward, dispatch]);

  if (!lastReward) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-[1100] max-w-sm rounded-lg bg-purpleMain text-white shadow-lg p-4 flex items-start gap-3"
    >
      <p className="text-sm flex-1">
        +{lastReward.awardedExp} EXP
        {lastReward.levelsGained > 0 && (
          <span className="ml-2 font-bold text-yellow-300">
            Level up x{lastReward.levelsGained}!
          </span>
        )}
      </p>
      <button
        type="button"
        onClick={() => dispatch(clearLastReward())}
        aria-label="Dismiss"
        className="text-gray-300 hover:text-white text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
};

export default PetRewardToast;
