import { useState } from "react";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/userSlice";
import queryClient from "../../lib/queryClient";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FadeUpContainer from "../animation/FadeUpContainer";

import ReactDOM from "react-dom";

function Logout() {
  const dispatch = useDispatch();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      localStorage.clear();

      queryClient.removeQueries({ queryKey: ["tasks"] });
      queryClient.removeQueries({ queryKey: ["summary"] });
      queryClient.removeQueries({ queryKey: ["summaryByCategory"] });
      queryClient.setQueryData(["user"], null);
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>
        <FontAwesomeIcon
          icon={faRightFromBracket}
          className=" text-2xl text-gray-400 hover:text-deadlineTheme p-2"
        />
      </button>

      {showConfirm &&
        ReactDOM.createPortal(
          <div className="popup-overlay ">
            <FadeUpContainer>
              <div className="popup-content border-2 p-8  rounded-xl border-purpleNormal bg-purpleSidebar">
                <div>
                  <p className="text-2xl text-white text-center">
                    Are you sure you want to logout ?
                  </p>
                  <div className="flex justify-center gap-4 mt-6">
                    <button
                      className="transition-all duration-100 ease-in-out text-deadlineTheme border-deadlineTheme text-2xl border-2 p-2 px-4 rounded-xl hover:bg-deadlineTheme hover:text-white"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                    <button
                      className=" transition-all duration-100 ease-in-out text-violet-400 border-violet-400 text-2xl border-2 p-2 px-4 rounded-xl hover:bg-violet-400 hover:text-white"
                      onClick={() => setShowConfirm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </FadeUpContainer>
          </div>,
          document.body
        )}
    </>
  );
}

export default Logout;

