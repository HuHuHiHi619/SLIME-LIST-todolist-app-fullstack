import React , { Suspense } from "react";
import Navbar from "./pages/fixbar/Navbar";
import { Outlet } from "react-router-dom";
const Sidebar = React.lazy(() =>  import("./pages/fixbar/Sidebar"))

function MainLayout() {
  return (
    <section id="mainLayout">
      <div className="grid grid-col ">
        <Navbar />
        <Suspense fallback= {null}>
          <Sidebar />
        </Suspense>

        <Outlet />
      </div>
    </section>
  );
}

export default MainLayout;
