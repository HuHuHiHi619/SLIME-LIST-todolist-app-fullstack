import React , { Suspense } from "react";
import Navbar from "./pages/fixbar/Navbar";
import { Outlet } from "react-router-dom";
const Sidebar = React.lazy(() =>  import("./pages/fixbar/Sidebar"))

function MainLayout() {
  return (
    <section id="mainLayout">
    <div className="layout-container">
      <Navbar />
      <div className="content-wrapper">
        <Suspense fallback={null}>
          <Sidebar />
        </Suspense>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  </section>
  );
}

export default MainLayout;
