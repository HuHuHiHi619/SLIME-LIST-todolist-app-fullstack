import React, {  useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Tabs from "@radix-ui/react-tabs";
import Register from "../authen/Register";
import Login from "../authen/Login";
import { motion } from "framer-motion";

function AuthTabs() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine initial tab value based on current route
  const isRegisterPage = location.pathname === "/register";
  const [activeTab, setActiveTab] = useState(
    isRegisterPage ? "register" : "login"
  );
  
  // Handle tab change and update URL
  const handleTabChange = (value) => {
    setActiveTab(value);
    navigate(`/${value}`,{
      replace: true,
      state: location.state
    });
  };

  useEffect(() => {
    const handleBackwards = () => {
      if(location.state?.from){
        navigate(location.state.from)
      }
    }
    window.addEventListener('popstate', handleBackwards)
    return () => {
      window.removeEventListener('popstate',handleBackwards)
    }
  },[navigate,location.state])

  return (
    <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
      <div className="w-full max-w-[300px] fixed top-[9vh] left-1/2 transform -translate-x-1/2 ">
        <Tabs.List className="grid grid-cols-2  ring ring-purpleNormal rounded-xl relative">
          {/* This is the animated background that moves */}
          <motion.div
            className="absolute w-1/2 h-full bg-purpleBorder  rounded-xl "
            initial={false}
            animate={{
              x: activeTab === "register" ? 0 : "100%",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />

          {/* Static trigger buttons */}
          <Tabs.Trigger
            value="register"
            className="z-10 flex-1 py-3 text-center text-lg transition-colors"
            style={{
              color: activeTab === "register" ? "white" : "rgb(107, 114, 128)",
            }}
          >
            Sign up
          </Tabs.Trigger>

          <Tabs.Trigger
            value="login"
            className="z-10 flex-1 py-3 text-center text-lg transition-colors"
            style={{
              color: activeTab === "login" ? "white" : "rgb(107, 114, 128)",
            }}
          >
            Sign in
          </Tabs.Trigger>
        </Tabs.List>
      </div>
        <div>
          <Tabs.Content value="register">
            <Register />
          </Tabs.Content>

          <Tabs.Content value="login">
            <Login />
          </Tabs.Content>
        </div>
    </Tabs.Root>
  );
}

export default AuthTabs;
