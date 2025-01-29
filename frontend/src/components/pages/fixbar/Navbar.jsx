import { React, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NotificationForm from "../ui/NotificationForm";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { toggleSidebarPinned } from "../../../redux/taskSlice";

function Navbar() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.user);
  const { isSidebarPinned } = useSelector((state) => state.tasks);

  const handlePinSidebar = () => {
    dispatch(toggleSidebarPinned());
    console.log(isSidebarPinned);
  };

  useEffect(() => {
    console.log("Authentication status:", isAuthenticated);
  }, [isAuthenticated]);

  if (loading) {
    return null;
  }

  return (
    <>
      <div id="nav-bar">
          <FontAwesomeIcon
            icon={faBars}
            onClick={handlePinSidebar}
            className="px-4 text-white text-2xl cursor-pointer hover:scale-105 md:hidden"
          />
        <Link to="/" className=" flex items-center gap-3 pl-4 pr-12">
          <img src="./images/Logo-slime.png" className="w-12" alt="" />
          <p className="text-xl lg:text-2xl text-white ">SLIME LIST</p>
        </Link>
        {!isAuthenticated && (
          <div className="flex mx-4 gap-4 items-center">
            <Link to="/register" >
              <button className="register">Sign up</button>
            </Link>
            <Link to="/login" className="hidden md:block">
              <button className="login">Sign in</button>
            </Link>
          </div>
        )}
        {isAuthenticated && <NotificationForm />}
      </div>
    </>
  );
}

export default Navbar;
