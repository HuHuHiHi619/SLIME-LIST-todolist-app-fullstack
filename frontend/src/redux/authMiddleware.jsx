import { getRefreshToken } from "../functions/authen";
import { clearSummaryState } from "./summarySlice";
import {
  logoutUser,
  updateTokens,
  setAuthError,
  fetchUserData,
} from "./userSlice";
import Cookies from "js-cookie";

const authMiddleware = (store) => (next) => async (action) => {
  const result = next(action);
  const state = store.getState();
  const { isAuthenticated, tokens, isRefreshing } = state.user;

  if (isRefreshing || action.type.startsWith("user/loginUser")) {
    return result;
  }

  if (isAuthenticated && action.type === "user/fetchUserData") {
    try {
      const { accessToken, refreshToken } = tokens;
      if (!accessToken || !checkTokenvalidity(accessToken)) {
        if (!isRefreshing) {
          try {
            store.dispatch({ type: "auth/refreshStart" });
            const newAccessToken = await getRefreshToken(refreshToken);
            if (!newAccessToken) {
              throw new Error("Failed to get new access token");
            }
            Cookies.set("accessToken", newAccessToken);
            Cookies.set("refreshToken", refreshToken);
            await store.dispatch(
              updateTokens({ accessToken: newAccessToken, refreshToken })
            );
            await store.dispatch(fetchUserData());
          } catch (error) {
            console.error("Refresh token failed:", refreshError);
            Cookies.remove("accessToken");
            Cookies.remove("refreshToken");
            await store.dispatch(logoutUser());
            await store.dispatch(clearSummaryState());
            await store.dispatch(
              setAuthError("Session expired. Please login again.")
            );
          }
        } else {
          throw new Error("Failed to get new access token");
        }
      }
    } catch (error) {
      console.error("Auth middleware error:", error);
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      await store.dispatch(logoutUser());
      await store.dispatch(clearSummaryState());
      await store.dispatch(setAuthError(error.message));
    } finally {
      store.dispatch({ type: "auth/refreshEnd" });
    }
  }
  return result;
};
const checkTokenvalidity = (token) => {
  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    return decoded.exp * 1000 > (Date.now() + 30000);
  } catch {
    return false;
  }
};

export default authMiddleware;
