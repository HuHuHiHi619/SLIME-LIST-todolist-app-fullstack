import { React, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NotificationForm from "../ui/NotificationForm";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars} from "@fortawesome/free-solid-svg-icons";
import { toggleSidebarPinned } from "../../../redux/taskSlice";

function Navbar() {
  const dispatch = useDispatch()
  const { isAuthenticated , loading} = useSelector((state) => state.user)
  const {  isSidebarPinned } = useSelector((state) => state.tasks)  

  const handlePinSidebar = () => {
   dispatch(toggleSidebarPinned())
   console.log(isSidebarPinned)
  }

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
        <div className="ml-4 p-2 flex ">
         <FontAwesomeIcon icon={faBars} onClick={ handlePinSidebar}  className="text-white text-3xl cursor-pointer hover:scale-105 xl:hidden"/>
        </div>
        { !isAuthenticated && (
          <div className="flex mx-4 gap-4">
          <Link to="/register" className="hidden md:block">
            <button className="register">Sign up</button>
          </Link>
          <Link to="/login">
            <button className="login">Login</button>
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
