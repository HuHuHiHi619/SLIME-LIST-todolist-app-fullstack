import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../redux/userSlice";
import { clearTask } from "../../../redux/taskSlice";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clearSummaryState } from "../../../redux/summarySlice";
import FadeUpContainer from "../animation/FadeUpContainer"
import Cookies from "js-cookie";
import ReactDOM from "react-dom";

function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await dispatch(logoutUser()).unwrap();

      Cookies.remove("accessToken", { path: "/" });
      Cookies.remove("refreshToken", { path: "/" });

      localStorage.clear();

      dispatch(clearTask());
      dispatch(clearSummaryState());
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className=" flex red-button mx-14 gap-4 items-center logout text-2xl   "
      >
        <FontAwesomeIcon icon={faRightFromBracket} className=" text-xl" />
        Log out
      </button>

      {showConfirm &&
        ReactDOM.createPortal(
        
            <div className="popup-overlay">
                <FadeUpContainer>
              <div className="popup-content border-4 p-8 rounded-xl border-purpleNormal bg-purpleSidebar">
                <p className="text-2xl text-white">
                  Are you sure you want to logout ?
                </p>
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    className="text-deadlineTheme border-deadlineTheme text-2xl border-2 p-4 rounded-xl hover:bg-deadlineTheme hover:text-white"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                  <button
                    className="opacity-50 text-violet-400 border-violet-400 text-2xl border-2 p-4 rounded-xl hover:bg-violet-400 hover:text-white"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </button>
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
