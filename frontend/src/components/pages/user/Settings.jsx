import React from "react";
import { useSelector } from "react-redux";
import FadeUpContainer from "../animation/FadeUpContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoltLightning,
  faLifeRing,
  faTrophy,
  faCalendarDays,
  faFire,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const profileFields = [
  { 
    icon: faUser, 
    label: "Username", 
    valueKey: "username",
    color: "text-blue-400"
  },
  { 
    icon: faFire, 
    label: "Current Streak", 
    valueKey: "currentStreak",
    color: "text-orange-400",
    suffix: " days"
  },
  { 
    icon: faBoltLightning, 
    label: "Best Streak", 
    valueKey: "bestStreak",
    color: "text-yellow-400",
    suffix: " days"
  },
  {
    icon: faTrophy,
    label: "Current Badge",
    valueKey: "currentBadge",
    color: "text-purple-400",
    transform: (v) => v?.toUpperCase() || "NO BADGE",
  },
  {
    icon: faCalendarDays,
    label: "Last Completed",
    valueKey: "lastCompleted",
    color: "text-green-400",
    transform: (v) =>
      v ? new Date(v).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : "No activity yet",
  },
];

function Settings() {
  const { userData, loading, error, isAuthenticated } = useSelector(
    (state) => state.user
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md">
          <div className="text-red-400 text-center">
            <FontAwesomeIcon icon={faLifeRing} className="text-2xl mb-2" />
            <p className="text-lg ">Something went wrong</p>
            <p className="text-xl opacity-80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('settings status isAuthenticate:', isAuthenticated);
  return (
    <div
      id="otherPage"
      className={`${isAuthenticated ? "py-4 px-4" : "flex justify-center pt-72"}`}
    >
      {isAuthenticated ? (
        <FadeUpContainer direction="up" delay={0.2}>
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="bg-purpleGradient rounded-3xl p-0.5 mb-4 shadow-2xl">
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 bg-progressGradient rounded-full flex items-center justify-center shadow-lg">
                      <FontAwesomeIcon icon={faUser} className="text-white text-3xl" />
                    </div>

                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl  text-white mb-2">
                      {userData?.username || 'User'}
                    </h1>
                    <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                      <span className="bg-blue-500/20 text-blue-300 p-3 px-5 rounded-full ">
                        {userData?.currentBadge || ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
              {profileFields.slice(1, 4).map(({ icon, label, valueKey, color, suffix = "", transform }) => (
                <div key={label} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className={`${color} text-2xl`}>
                      <FontAwesomeIcon icon={icon} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xl ">{label}</p>
                      <p className="text-white text-xl ">
                        {transform
                          ? transform(userData?.[valueKey])
                          : (userData?.[valueKey] || 0) + suffix}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Profile Info */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border-2 border-purpleNormal overflow-hidden">
              <div className="bg-progressGradient p-6">
                <h2 className="text-2xl  text-white flex items-center gap-3">
                  <FontAwesomeIcon icon={faUser} />
                  Profile Details
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileFields.map(({ icon, label, valueKey, color, suffix = "", transform }) => (
                    <div key={label} className="group">
                      <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-700/30 transition-all duration-200">
                        <div className={`${color} text-xl mt-1 group-hover:scale-110 transition-transform duration-200`}>
                          <FontAwesomeIcon icon={icon} />
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-400 text-xl  uppercase tracking-wide mb-1">
                            {label}
                          </p>
                          <p className="text-white text-xl">
                            {transform
                              ? transform(userData?.[valueKey])
                              : (userData?.[valueKey] || 'Not set') + suffix}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
