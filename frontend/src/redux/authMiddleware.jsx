
import { getRefreshToken } from "../functions/authen";
import { logoutUser, updateTokens } from "./userSlice";
import Cookies from "js-cookie"

const authMiddleware = (store) => (next) => async (action) => {
    
    const state = store.getState();
    const { isAuthenticated , tokens} = state.user
   

    if(isAuthenticated && action.type.startsWith('user/fetchUserData')) {
        try{
            const { accessToken , refreshToken } = tokens
            if(accessToken || !checkTokenvalidity(accessToken)){
                const newAccessToken = await getRefreshToken(refreshToken);
                Cookies.set('accessToken', newAccessToken);
                Cookies.set('refreshToken', refreshToken);
                store.dispatch(updateTokens({accessToken : newAccessToken , refreshToken}))
            }
           
        }catch(error){
            console.error('Refresh token failed:', error);
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            store.dispatch(logoutUser());
        }
    }
    return next(action);
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