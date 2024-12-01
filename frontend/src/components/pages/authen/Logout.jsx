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
    <button
      onClick={handleLogout}
      className=" flex clear-task justify-center gap-4 items-center logout text-2xl  "
    >
      <FontAwesomeIcon icon={faRightFromBracket} className=" text-xl" />
      Log out
    </button>
  );
}

export default Logout;
