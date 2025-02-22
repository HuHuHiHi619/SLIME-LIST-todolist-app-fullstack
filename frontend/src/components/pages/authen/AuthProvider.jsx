import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData } from "../../../redux/userSlice";
import Cookies from "js-cookie";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, isRefreshing } = useSelector((state) => state.user);
  const [initialCheckDone, setInitialCheckDone] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      const accessToken = Cookies.get("accessToken");
      if (accessToken) {
        try {
          await dispatch(fetchUserData()).unwrap();
        } catch (error) {
          console.error("Initial auth check failed:", error);
        }
      }
      setInitialCheckDone(true);
    };
    checkAuth();
  }, [dispatch]);

  React.useEffect(() => {
    let interval;
    if (isAuthenticated && initialCheckDone && !isRefreshing) {
        interval = setInterval(async () => {
            try{
                await dispatch(fetchUserData()).unwrap()
            } catch(error){
                console.error('Error refreshing user data:', error);
            }
        }, 3 * 60 * 1000);
      }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAuthenticated,isRefreshing, initialCheckDone, dispatch]);

  
  if (!initialCheckDone) {
    return null;
  }

  return children;
};

export default AuthProvider;
