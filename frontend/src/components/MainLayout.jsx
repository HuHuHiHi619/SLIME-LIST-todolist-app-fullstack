import React from "react";
import Navbar from "./pages/fixbar/Navbar";
import Sidebar from "./pages/fixbar/Sidebar";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <section id="mainLayout">
      <div className="grid grid-col">
        <Navbar />

        <Sidebar />
        
          <Outlet />
       
      </div>
    </section>
  );
}

export default MainLayout;
