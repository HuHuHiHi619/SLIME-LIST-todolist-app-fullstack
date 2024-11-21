import React from "react";
import Navbar from "./pages/fixbar/Navbar";
import Sidebar from "./pages/fixbar/Sidebar";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <section id="mainLayout">
      <div className="flex">
        <Sidebar />
        <div className="flex-grow">
          <Navbar />
          <Outlet />
        </div>
      </div>
    </section>
  );
}

export default MainLayout;
