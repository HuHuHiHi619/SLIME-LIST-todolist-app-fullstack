import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useSelector } from "react-redux"; 

// --- Configuration & Utilities ---
import "./Config/axiosConfig"; 
import "./App.css"; 

// --- Layout Component ---
import MainLayout from "./components/MainLayout"; // Main application layout

// --- Authentication Components ---
import AuthProvider from "./components/auth/AuthProvider";
import PublicRoute from "./components/auth/PublicRoute";
import LoadingPage from "./components/animation/LoadingPage";
import TaskErrorToast from "./components/feedback/TaskErrorToast";
import PetRewardToast from "./components/feedback/PetRewardToast";
import ErrorBoundary from "./components/ErrorBoundary";

// --- Lazy Loaded Components (Code Splitting) ---
const Home = lazy(() => import("./components/views/Home"));
const Upcoming = lazy(() => import("./components/views/Upcoming"));
const AllTask = lazy(() => import("./components/views/AllTask"));
const Category = lazy(() => import("./components/views/Category"));
const CategoryList = lazy(() => import("./components/views/CategoryList"));
const Settings = lazy(() => import("./components/views/Settings"));

// Authentication Pages
const AuthTabs = lazy(() => import("./components/auth/AuthTabs"));

function App() {
  const { isAuthenticated, isGuest } = useSelector((state) => state.user);

  return (
    <AuthProvider skip={isGuest}>
      <ErrorBoundary>
        <TaskErrorToast />
        <PetRewardToast />
        <BrowserRouter>
          <Suspense fallback={<LoadingPage />}>
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
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;

