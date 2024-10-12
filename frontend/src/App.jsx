import { useState } from "react";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";

// component
import Home from "./components/pages/user/Home";
import MainLayout from "./components/MainLayout";
import Profile from "./components/pages/user/Profile";
import Settings from "./components/pages/user/Settings";

// authen
import Register from "./components/pages/authen/Register";
import Login from "./components/pages/authen/Login";

// user
import HomeUser from "./components/pages/user/HomeUser";
// admin

// routes
import UserRoutes from "./routes/UserRoutes";
import "./App.css";
import Upcoming from "./components/pages/user/Upcoming";
import AllTask from "./components/pages/user/AllTask";
import Category from "./components/pages/user/Category";
import Tag from "./components/pages/user/Tag";

function App() {


  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Home page */}
            <Route index element={<Home />} />
            <Route path="/upcoming" element={<Upcoming />} />
            <Route path="/all-tasks" element={<AllTask />} />
            <Route path="/category" element={<Category />} />
            <Route path="/tag" element={<Tag />} />
            <Route path="/settings" element={<Settings />} />

            {/* User */}
            <Route
              path="/user/index"
              element={
                <UserRoutes>
                  <HomeUser />
                </UserRoutes>
              }
            />
  
          </Route>
          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
