import React, { useState , forwardRef } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import Register from "../authen/Register";
import Login from "../authen/Login";
import { motion } from "framer-motion";

const AuthTabs = forwardRef((props,ref) => {
  const [activeTab, setActiveTab] = useState("login");  // default is "login"

  // Handle tab change without affecting URL
  const handleTabChange = (value) => {
    setActiveTab(value);  // Just update activeTab state
  };

  return (
    
    <Tabs.Root value={activeTab} onValueChange={handleTabChange} ref={ref}>
      <div className="w-full max-w-[350px] mb-4  ml-9 ring ring-purpleNormal ring-offset-transparent ring-offset p-1 rounded-full">
        <Tabs.List className="grid grid-cols-2 border border-purpleNormal rounded-3xl relative">
          {/* This is the animated background that moves */}
          <motion.div
            className={`absolute w-1/2 h-full rounded-3xl ${activeTab === "register" ? "bg-purpleNormal" : "bg-purpleBorder"}`}
            initial={false}
            animate={{
              x: activeTab === "register" ? 0 : "100%",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 50 }}
          />
         

          {/* Static trigger buttons */}
          <Tabs.Trigger
            value="register"
            className={`z-10 flex-1 py-1 text-center md:text-2xl transition-colors ${
              activeTab === "register" ? "text-white" : "text-gray-500 hover:text-white"
            }`}
          >
            Sign up
          </Tabs.Trigger>

          <Tabs.Trigger
            value="login"
            className={`z-10 flex-1 py-1 text-center md:text-2xl transition-colors ${
              activeTab === "login" ? "text-white" : "text-gray-500 hover:text-white"
            }`}
          >
            Sign in
          </Tabs.Trigger>
        </Tabs.List>
      </div>

      <div>
        <Tabs.Content value="register">
          <Register onClose={() => handle}/>
        </Tabs.Content>

        <Tabs.Content value="login">
          <Login />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  
  );
})

export default AuthTabs;
