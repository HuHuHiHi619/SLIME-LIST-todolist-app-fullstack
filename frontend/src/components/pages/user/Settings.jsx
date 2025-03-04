import React, { useEffect } from "react";
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

function Settings() {
  const { userData, loading, error, isAuthenticated } = useSelector(
    (state) => state.user
  );
  console.log(userData)

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div
      id="otherPage"
      className={`${isAuthenticated ? "" : "flex justify-center pt-72"}`}
    >
      {isAuthenticated ? (
        <div className="mx-10 md:ml-32 mt-10 md:w-[500px] w-auto bg-purpleGradient rounded-2xl shadow-lg p-1 ">
          <div className="bg-purpleSidebar rounded-xl p-8">
            <h2 className="text-[40px] text-white mb-2">PROFILE</h2>

            <div className="flex flex-col gap-6">
              <div>
                <FontAwesomeIcon
                  icon={faUser}
                  className="text-gray-500 pr-2 text-2xl"
                />
                <span className="text-gray-500 text-xl">USERNAME</span>
                <br />
                <span className="text-white text-xl ml-8  px-4 py-1 rounded-md bg-purpleNormal ">
                  {userData.username}
                </span>
              </div>

              <div>
                <FontAwesomeIcon
                  icon={faBolt}
                  className="text-gray-500 pr-2 text-2xl"
                />
                <span className="text-gray-500 text-xl ">CURRENT STREAK</span>
                <br />
                <span className="text-white text-xl  ml-8  px-4 py-1 rounded-md bg-purpleNormal ">
                  {userData.currentStreak}
                </span>
              </div>

              <div>
                <FontAwesomeIcon
                  icon={faBoltLightning}
                  className="text-gray-500 pr-2 text-2xl"
                />
                <span className="text-gray-500 text-xl">BEST STREAK</span>
                <br />
                <span className="text-white text-xl  ml-8  px-4 py-1 rounded-md bg-purpleNormal ">
                  {userData.bestStreak}
                  </span>
              </div>

              <div>
                <FontAwesomeIcon
                  icon={faRibbon}
                  className="text-gray-500 pr-2 text-2xl"
                />
                <span className="text-gray-500 text-xl">CURRENT BADGE</span>
                <br />
                <span className="text-white text-xl  ml-8  px-4 py-1 rounded-md bg-purpleNormal ">
                  {userData.currentBadge.toUpperCase()}
                </span>
              </div>

              <div>
                <FontAwesomeIcon
                  icon={faLifeRing}
                  className="text-gray-500 pr-2 text-2xl"
                />
                <span className="text-gray-500 text-xl">LAST COMPLETED</span>
                <br />
                <span className="text-white text-xl  ml-8  px-4 py-1 rounded-md bg-purpleNormal ">
                  {userData.lastCompleted
                    ? new Date(userData.lastCompleted).toLocaleDateString()
                    : "No data"}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <FadeUpContainer direction="up" delay={0.2}>
            <p className="md:text-4xl text-white">
              PLEASE LOG IN TO SEE YOU SETTINGS
            </p>
          </FadeUpContainer>
        </div>
      )}
    </div>
  );
}

export default Settings;
