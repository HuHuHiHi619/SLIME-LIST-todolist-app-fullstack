import React from "react";
import { useSelector } from "react-redux";
import FadeUpContainer from "../animation/FadeUpContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faBoltLightning,
  faLifeRing,
  faRibbon,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const profileFields = [
  { icon: faUser, label: "USERNAME", valueKey: "username" },
  { icon: faBolt, label: "CURRENT STREAK", valueKey: "currentStreak" },
  { icon: faBoltLightning, label: "BEST STREAK", valueKey: "bestStreak" },
  {
    icon: faRibbon,
    label: "CURRENT BADGE",
    valueKey: "currentBadge",
    transform: (v) => v.toUpperCase(),
  },
  {
    icon: faLifeRing,
    label: "LAST COMPLETED",
    valueKey: "lastCompleted",
    transform: (v) =>
      v ? new Date(v).toLocaleDateString() : "No data",
  },
];

function Settings() {
  const { userData, loading, error, isAuthenticated } = useSelector(
    (state) => state.user
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div
      id="otherPage"
      className={`${isAuthenticated ? "" : "flex justify-center pt-72"}`}
    >
      {isAuthenticated ? (
        <FadeUpContainer direction="up" delay={0.2}>
          <div className="mx-10 mt-10 md:w-[500px] w-auto bg-purpleGradient rounded-2xl shadow-lg p-1">
            <div className="bg-purpleSidebar rounded-xl p-8">
              <h2 className="text-[40px] text-white mb-2">PROFILE</h2>
              <div className="flex flex-col gap-6">
                {profileFields.map(({ icon, label, valueKey, transform }) => (
                  <div key={label}>
                    <FontAwesomeIcon icon={icon} className="text-gray-500 pr-2 text-2xl" />
                    <span className="text-gray-500 text-xl ">{label}</span>
                   
                    <span className="text-white text-xl ml-8 px-4 py-1 rounded-md bg-purpleNormal">
                      {transform
                        ? transform(userData[valueKey])
                        : userData[valueKey]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeUpContainer>
      ) : (
        <FadeUpContainer direction="up" delay={0.2}>
          <p className="md:text-4xl text-white">
            PLEASE LOG IN TO SEE YOUR SETTINGS
          </p>
        </FadeUpContainer>
      )}
    </div>
  );
}

export default Settings;
