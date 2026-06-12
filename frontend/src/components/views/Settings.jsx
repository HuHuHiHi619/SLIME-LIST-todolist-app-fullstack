import { useState } from "react";
import { useSelector } from "react-redux";
import FadeUpContainer from "../animation/FadeUpContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoltLightning,
  faLifeRing,
  faCalendarDays,
  faFire,
  faUser,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { POMODORO_STORAGE_KEYS } from "../pomodoro/PomodoroTimer";

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

const readMin = (key, fallback) => {
  const v = parseInt(localStorage.getItem(key), 10);
  return Number.isFinite(v) && v > 0 ? v : fallback;
};

function Settings() {
  const { userData, loading, error, isAuthenticated } = useSelector(
    (state) => state.user
  );

  const [workMin,  setWorkMin]  = useState(() => readMin(POMODORO_STORAGE_KEYS.workMin,  25));
  const [breakMin, setBreakMin] = useState(() => readMin(POMODORO_STORAGE_KEYS.breakMin, 5));
  const [saved, setSaved] = useState(false);

  const handleSavePomodoroSettings = () => {
    localStorage.setItem(POMODORO_STORAGE_KEYS.workMin,  workMin);
    localStorage.setItem(POMODORO_STORAGE_KEYS.breakMin, breakMin);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
                        {userData?.username || ''}
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

      {/* Pomodoro Settings — available to all users, localStorage only */}
      <div className={`${isAuthenticated ? "max-w-4xl mx-auto mt-4 px-0" : "max-w-md mx-auto mt-8 px-4"}`}>
        <FadeUpContainer direction="up" delay={0.3}>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border-2 border-purpleNormal overflow-hidden">
            <div className="bg-progressGradient p-6">
              <h2 className="text-2xl text-white flex items-center gap-3">
                <FontAwesomeIcon icon={faClock} />
                Pomodoro Timer
              </h2>
            </div>
            <div className="p-6 flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 text-xl uppercase tracking-wide">
                  Work (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={workMin}
                  onChange={(e) => setWorkMin(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="bg-slate-700 text-white text-xl rounded-lg px-4 py-2 w-28 border border-slate-600 focus:border-purple-400 outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 text-xl uppercase tracking-wide">
                  Break (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={breakMin}
                  onChange={(e) => setBreakMin(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="bg-slate-700 text-white text-xl rounded-lg px-4 py-2 w-28 border border-slate-600 focus:border-purple-400 outline-none"
                />
              </div>
              <button
                onClick={handleSavePomodoroSettings}
                className="bg-purpleNormal hover:bg-purpleActive text-white px-6 py-2 rounded-xl text-xl transition-colors"
              >
                {saved ? "Saved!" : "Save"}
              </button>
            </div>
          </div>
        </FadeUpContainer>
      </div>
    </div>
  );
}

export default Settings;
