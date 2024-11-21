import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import FadeUpContainer from '../animation/FadeUpContainer';

function Settings() {
  const { userData, loading, error, isAuthenticated } = useSelector((state) => state.user);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div id="otherPage" className={`${isAuthenticated ? '' : 'flex justify-center pt-64'}`}>
      {isAuthenticated ? (
        <div className="ml-10 max-w-2xl w-full border-4 border-purpleNormal  rounded-lg shadow-lg p-6 space-y-6">
          <div> 
            <h2 className="text-2xl text-white mb-2">PROFILE</h2>
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-white text-xl">Username: {userData.username}</p>
                <p className="text-white">Current Streak: {userData.currentStreak}</p>
                <p className="text-white">Best Streak: {userData.bestStreak}</p>
                <p className="text-white">Current Badge: {userData.currentBadge}</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-white mb-2">System Settings</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="theme" className="text-white">
                  Theme
                </label>
                <input
                  id="theme"
                  type="text"
                  value={userData.settings.theme}
                  readOnly
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="notification" className="text-white">
                  Notifications
                </label>
                <div className="relative inline-block w-16 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="notification"
                    checked={userData.settings.notification}
                    readOnly
                    className="checked:bg-blue-500 outline-none focus:outline-none top-1  checked:right-1 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="notification"
                    className="block overflow-hidden h-9  w-18 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-white mb-2">Additional Info</h2>
            <p className="text-white">Last Completed: {userData.lastCompleted ? new Date(userData.lastCompleted).toLocaleDateString() : 'No data'}</p>
          </div>
          
        </div>
      ) : (
        <div>
          <FadeUpContainer direction="up" delay={0.2}>

          <h1 className="text-4xl text-white">PLEASE LOG IN TO SEE YOU SETTINGS</h1>
          </FadeUpContainer>
        </div>
      )}
    </div>
  );
}

export default Settings;