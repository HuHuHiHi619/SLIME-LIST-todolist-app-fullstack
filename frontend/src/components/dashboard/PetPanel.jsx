import { useSelector } from "react-redux";
import { usePetQuery } from "../../hooks/queries/usePet";

function PetPanel() {
  const { data: pet, isLoading, isError } = usePetQuery();
  const lastReward = useSelector((state) => state.pet.lastReward);

  if (isLoading) return <p className="text-white">Loading pet...</p>;
  if (isError || !pet) return <p className="text-white">No pet data.</p>;

  return (
    <div className="border border-white p-3 rounded-xl text-white text-sm space-y-1">
      <p>Stage: {pet.evolutionStage}</p>
      <p>Level: {pet.level}</p>
      <p>EXP: {pet.exp}</p>
      <p>Happiness: {pet.happiness}</p>
      {lastReward && (
        <p className="text-green-400">
          +{lastReward.awardedExp} EXP
          {lastReward.levelsGained > 0 && ` · Level up x${lastReward.levelsGained}`}
        </p>
      )}
    </div>
  );
}

export default PetPanel;
