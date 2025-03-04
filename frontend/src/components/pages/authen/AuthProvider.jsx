import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData , logoutUser , setAuthError} from "../../../redux/userSlice";
import { clearSummaryState } from "../../../redux/summarySlice";
import Cookies from "js-cookie";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, isRefreshing } = useSelector((state) => state.user);
  const [initialCheckDone, setInitialCheckDone] = React.useState(false);

  const checkTokenvalidity = (token) => {
    if (!token) return false;
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      return decoded.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  };

  React.useEffect(() => {
    const checkAuth = async () => {
      const accessToken = Cookies.get("accessToken");

      if (accessToken && checkTokenvalidity(accessToken)) {
        try {
          await dispatch(fetchUserData()).unwrap();
        } catch (error) {
          console.error("Initial auth check failed:", error);
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          dispatch(logoutUser());
          dispatch(clearSummaryState());
          dispatch(setAuthError("Session expired. Please login again."));
        }
      } else if (accessToken && !checkTokenvalidity(accessToken)) {
        console.warn("Expired token detected on initial load");
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        dispatch(logoutUser());
        dispatch(clearSummaryState());
      }
      setInitialCheckDone(true);
    };
    checkAuth();
  }, [dispatch]);

  React.useEffect(() => {
    let interval;
    if (isAuthenticated && initialCheckDone && !isRefreshing) {
      interval = setInterval(async () => {
        try {
          if (accessToken && checkTokenvalidity(accessToken)) {
            await dispatch(fetchUserData()).unwrap();
          } else {
            console.warn("Token invalid during interval check");
            Cookies.remove("accessToken");
            Cookies.remove("refreshToken");
            dispatch(logoutUser());
            dispatch(clearSummaryState());
            dispatch(setAuthError("Session expired. Please login again."));
          }
        } catch (error) {
          console.error("Error refreshing user data:", error);
        }
      }, 3 * 60 * 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAuthenticated, isRefreshing, initialCheckDone, dispatch]);

  if (!initialCheckDone) {
    return null;
  }

  return children;
};

export default AuthProvider;
