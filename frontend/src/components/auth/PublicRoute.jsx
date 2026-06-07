import { Navigate } from "react-router-dom";

const PublicRoute = ({ isAuthenticated, children }) => {
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

export default PublicRoute;
