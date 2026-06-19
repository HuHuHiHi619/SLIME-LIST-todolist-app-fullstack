import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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
const Home      = lazy(() => import("./components/views/Home"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const Settings  = lazy(() => import("./components/views/Settings"));
const Pomodoro  = lazy(() => import("./components/views/Pomodoro"));

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

              <Route path="/tasks" element={<TasksPage />} />

              {/* Legacy routes → redirect to unified tasks page */}
              <Route path="/all-tasks"              element={<Navigate to="/tasks" replace />} />
              <Route path="/upcoming"               element={<Navigate to="/tasks" replace />} />
              <Route path="/category"               element={<Navigate to="/tasks" replace />} />
              <Route path="/category/:categoryName" element={<Navigate to="/tasks" replace />} />

              <Route path="/settings" element={<Settings />} />
              <Route path="/pomodoro" element={<Pomodoro />} />
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

