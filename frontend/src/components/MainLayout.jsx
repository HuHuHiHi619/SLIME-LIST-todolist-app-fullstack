import Navbar from "./layout/Navbar";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <section id="mainLayout" className="slime-root">
      <div className="layout-container">
        <Navbar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </section>
  );
}

export default MainLayout;
