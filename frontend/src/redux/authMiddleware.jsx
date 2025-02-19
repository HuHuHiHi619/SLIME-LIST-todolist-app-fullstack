
import { getRefreshToken } from "../functions/authen";
import { logoutUser, updateTokens, setAuthError } from "./userSlice";
import Cookies from "js-cookie"

const authMiddleware = (store) => (next) => async (action) => {
   
    const result = next(action)
    const state = store.getState();
    const { isAuthenticated , tokens , isRefreshing } = state.user

    if(isAuthenticated && tokens.accessToken){
        const isValid = checkTokenvalidity(tokens.accessToken)
        if(!isValid && action.type !== "auth/refreshStart" && action.type !== "auth/refreshEnd"){
            store.dispatch(logoutUser());
            return next(action)
        }
    }

    if (action.type.startsWith('user/loginUser')) {
        return next(action); 
    }

    if (isRefreshing) {
        return next(action); 
    }
   
    if(isAuthenticated && action.type ===  'user/fetchUserData') {
        try{
            const { accessToken , refreshToken } = tokens
            if(!accessToken || !checkTokenvalidity(accessToken)){
                if(!isRefreshing){
                    store.dispatch({type: 'auth/refreshStart'})
                    const newAccessToken = await getRefreshToken(refreshToken);
                    Cookies.set('accessToken', newAccessToken);
                    Cookies.set('refreshToken', refreshToken);
                    store.dispatch(updateTokens({accessToken : newAccessToken , refreshToken}))
                    store.dispatch(action);
                } else {
                    throw new Error('Failed to get new access token')
                }
            }
           
        }catch(error){
            console.error('Auth middleware error:', error);
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            store.dispatch(setAuthError(error.message));
            store.dispatch(logoutUser());
        } finally {
            store.dispatch({type : 'auth/refreshEnd'})
        }
    }
    return result
}
const checkTokenvalidity = (token) => {
    try{
        const decoded = JSON.parse(atob(token.split('.')[1]))
        return decoded.exp * 1000 > Date.now()
    } catch {
        return false
    }
}

export default authMiddleware;