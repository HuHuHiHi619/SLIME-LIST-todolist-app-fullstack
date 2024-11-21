import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../redux/userSlice";
import { clearTask } from "../../../redux/taskSlice";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Cookies from "js-cookie";
import { clearSummaryState } from "../../../redux/summarySlice";

function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Dispatch logoutUser thunk action
      const response = await dispatch(logoutUser());
      console.log("Logout response:", response);

      // Clear cookies using js-cookie library
      Cookies.remove("accessToken", { path: "/" });
      Cookies.remove("refreshToken", { path: "/" });

      // Confirm cookie removal
      console.log("Cookies after logout:", document.cookie);
      localStorage.clear();
      // Dispatch action to clear tasks and navigate to login
      dispatch(clearTask());
      dispatch(clearSummaryState())
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <button onClick={handleLogout} className="mt-72 flex border-2 border-red-600 mx-4 p-2 rounded-xl justify-center gap-4 items-center hover:bg-red-300 ">
      <FontAwesomeIcon icon={faRightFromBracket} className="text-red-600 text-xl" />
      <h3 className="text-red-600">Log out</h3>
    </button>
  );
}

export default Logout;
