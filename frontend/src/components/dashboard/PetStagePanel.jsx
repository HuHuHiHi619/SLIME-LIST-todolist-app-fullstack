import { useSelector } from "react-redux";
import { usePetQuery } from "../../hooks/queries/usePet";

const TIER_CONFIG = {
  egg:   { label: "EGG",    color: "#9AA0B5" },
  baby:  { label: "BRONZE", color: "#D9925A" },
  teen:  { label: "SILVER", color: "#C7D1E0" },
  adult: { label: "GOLD",   color: "#F2C24B" },
};

const PET_IMAGES = {
  egg:   "/images/Logo-slime.png",
  baby:  "/images/Bronze-slime.png",
  teen:  "/images/Silver-slime.png",
  adult: "/images/Gold-slime.png",
};

const GLOW_COLORS = {
  egg:   "rgba(154,160,181,0.22)",
  baby:  "rgba(217,146,90,0.25)",
  teen:  "rgba(199,209,224,0.22)",
  adult: "rgba(242,194,75,0.25)",
};

function getMood(happiness) {
  if (happiness >= 71) return { label: "happy",  color: "#7DE3B0" };
  if (happiness >= 31) return { label: "normal", color: "#F4D78A" };
  return                       { label: "sad",    color: "#E2553D" };
}

function PetStagePanel() {
  const { userData } = useSelector((state) => state.user);
  const { data: pet, isLoading } = usePetQuery();

  if (isLoading || !pet) {
    return <div className="rounded-3xl border-2 border-purpleNormal bg-purpleMain p-6 flex flex-col min-h-[480px]" />;
  }

  const stage = pet.evolutionStage ?? "egg";
  const tier  = TIER_CONFIG[stage] ?? TIER_CONFIG.egg;
  const imgSrc = PET_IMAGES[stage] ?? PET_IMAGES.egg;
  const glow   = GLOW_COLORS[stage] ?? GLOW_COLORS.egg;
  const mood   = getMood(pet.happiness);
  const expMax = (pet.level + 1) * 100;
  const expPct = Math.min((pet.exp / expMax) * 100, 100);
  const name   = userData.username || "Slime";

  return (
    <div className="rounded-3xl border-2 border-purpleNormal bg-purpleMain p-6 flex flex-col min-h-[480px]">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-white text-6xl font-bold">{name}</h2>
          <span
            className="text-sm px-3 py-1 rounded-full border font-semibold tracking-widest"
            style={{ color: tier.color, borderColor: tier.color }}
          >
            {tier.label}
          </span>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-gray-400 text-xs tracking-widest">LEVEL</p>
          <p className="text-white text-8xl font-bold leading-none">{pet.level}</p>
        </div>
      </div>

      {/* Pet image with radial glow */}
      <div className="relative flex justify-center items-center flex-1 py-4">
        <div
          className="absolute w-72 h-72 rounded-full"
          style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 68%)` }}
        />
        <img
          src={imgSrc}
          alt={name}
          className="relative z-10 w-44 h-44"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      {/* Mood + bars — bottom-anchored */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 justify-center">
          <p style={{ color: "#7DE3B0" }}>♥</p>
          <p className="text-white text-sm">
            {name} is feeling{" "}
            <span style={{ color: mood.color }}>{mood.label}</span> today.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* EXP bar */}
          <div>
            <div className="flex justify-between mb-1">
              <p className="text-gray-400 text-xs tracking-widest">EXP</p>
              <p className="text-gray-400 text-xs">{pet.exp} / {expMax}</p>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#12112D" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${expPct}%`,
                  background: "linear-gradient(to right, #3434B2, #6D6DFD, #CE88FA)",
                }}
              />
            </div>
          </div>

          {/* Happiness bar */}
          <div>
            <div className="flex justify-between mb-1">
              <p className="text-gray-400 text-xs tracking-widest">HAPPINESS</p>
              <p className="text-gray-400 text-xs">{pet.happiness}%</p>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#12112D" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pet.happiness}%`,
                  background: "linear-gradient(to right, #E37DDE, #FF9ECF)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PetStagePanel;
