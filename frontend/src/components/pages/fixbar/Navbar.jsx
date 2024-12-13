import { React, useEffect } from "react";
import { useSelector } from "react-redux";
import NotificationForm from "../ui/NotificationForm";
import { Link } from "react-router-dom";

function Navbar() {
  const { isAuthenticated , loading} = useSelector((state) => state.user)
  useEffect(()=> {
    console.log("Authentication status:", isAuthenticated);
  },[isAuthenticated])

  if(loading){
    return (
     null
    )
  }

  return (
    <>
      <div id="nav-bar">
        <div>
         
        </div>
        { !isAuthenticated && (
          <div className="flex mx-10 gap-4">
          <Link to="/register">
            <button className="register">Sign up</button>
          </Link>
          <Link to="/login">
            <button className="login">login</button>
          </Link>
        </div>
        )}
        { isAuthenticated && (
          <NotificationForm />
        )}
      </div>
    </>
  );
}

export default Navbar;
