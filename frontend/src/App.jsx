import { useState } from "react";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";

// component
import Home from "./components/pages/user/Home";
import MainLayout from "./components/MainLayout";
import Settings from "./components/pages/user/Settings";

// authen
import Register from "./components/pages/authen/Register";
import Login from "./components/pages/authen/Login";
import AuthProvider from "./components/pages/authen/AuthProvider";
import ProtectedRoute from "./components/pages/authen/ProtectedRoute";

// user
import HomeUser from "./components/pages/user/HomeUser";
// admin

// routes
import UserRoutes from "./routes/UserRoutes";
import "./App.css";
import Upcoming from "./components/pages/user/Upcoming";
import AllTask from "./components/pages/user/AllTask";
import Category from "./components/pages/user/Category";
import CategoryList from "./components/pages/user/CategoryList";
import Tag from "./components/pages/user/Tag";
import TagList from "./components/pages/user/TagList";

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              {/* Home page */}
              <Route index element={<Home />} />
              <Route path="/upcoming" element={<Upcoming />} />
              <Route path="/all-tasks" element={<AllTask />} />
              <Route path="/category" element={<Category />} />
              <Route
                path="/category/:categoryName"
                element={<CategoryList />}
              />
              <Route path="/tag" element={<Tag />} />
              <Route path="/tag/:tagName" element={<TagList />} />
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
      </AuthProvider>
    </>
  );
}

export default App;
