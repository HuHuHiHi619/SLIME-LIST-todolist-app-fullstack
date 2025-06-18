import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useSelector } from "react-redux"; 

// --- Configuration & Utilities ---
import "./Config/axiosConfig"; 
import "./App.css"; 

// --- Layout Component ---
import MainLayout from "./components/MainLayout"; // Main application layout

// --- Authentication Components ---
import AuthProvider from "./components/pages/authen/AuthProvider"; // Provides authentication context or logic
import PublicRoute from "./components/pages/authen/PublicRoute"; // Component to restrict access for authenticated users

// --- Lazy Loaded Components (Code Splitting) ---
const Home = lazy(() => import("./components/pages/user/Home"));
const Upcoming = lazy(() => import("./components/pages/user/Upcoming"));
const AllTask = lazy(() => import("./components/pages/user/Alltask"));
const Category = lazy(() => import("./components/pages/user/Category"));
const CategoryList = lazy(() => import("./components/pages/user/CategoryList"));
const Tag = lazy(() => import("./components/pages/user/Tag"));
const TagList = lazy(() => import("./components/pages/user/TagList"));
const Settings = lazy(() => import("./components/pages/user/Settings"));

// Authentication Pages
const AuthTabs = lazy(() => import("./components/pages/authen/AuthTabs")); // Component containing login/register forms

function App() {
  const { isAuthenticated, isGuest } = useSelector((state) => state.user);

  return (
    <AuthProvider skip={isGuest}>
      <BrowserRouter>
        <Suspense fallback={<></>}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
