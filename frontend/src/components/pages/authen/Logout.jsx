import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../redux/userSlice";

function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await dispatch(logoutUser()).unwrap();
      console.log('Logout response:', response);

      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      console.log('Cookies after logout:', document.cookie);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return <button onClick={handleLogout}>Log out</button>;
}

export default Logout;
