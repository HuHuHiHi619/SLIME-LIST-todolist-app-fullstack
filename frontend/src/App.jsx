import { BrowserRouter, Route, Routes } from "react-router-dom";

// component
import Home from "./components/pages/user/Home";
import MainLayout from "./components/MainLayout";
import Settings from "./components/pages/user/Settings";

// authen
import AuthTabs from "./components/pages/ui/AuthTabs";

import AuthProvider from "./components/pages/authen/AuthProvider";

// routes
import PublicRoute from "./components/pages/authen/PublicRoute";
import "./App.css";
import Upcoming from "./components/pages/user/Upcoming";
import AllTask from "./components/pages/user/AllTask";
import Category from "./components/pages/user/Category";
import CategoryList from "./components/pages/user/CategoryList";
import Tag from "./components/pages/user/Tag";
import TagList from "./components/pages/user/TagList";
import { useSelector } from "react-redux";

function App() {
  const { isAuthenticated } = useSelector((state) => state.user);
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
            </Route>
            {/* Authentication */}
            <Route
              path="/login"
              element={
                <PublicRoute isAuthenticated={isAuthenticated}>
                  <AuthTabs />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute isAuthenticated={isAuthenticated}>
                  <AuthTabs />
                </PublicRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
