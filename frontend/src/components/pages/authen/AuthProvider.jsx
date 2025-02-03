import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserData, restoreState } from '../../../redux/userSlice';
import Cookies from "js-cookie"

const AuthProvider = ({ children }) => {  // เปลี่ยนเป็น arrow function
    const dispatch = useDispatch();
    const { isAuthenticated, userData } = useSelector((state) => state.user);
    const [initialCheckDone, setInitialCheckDone] = React.useState(false);

    React.useEffect(() => { 
        const checkAuth = async () => {
            const persistedAuth = Cookies.get('isAuthenticated');
            const persistedUserId = Cookies.get('userId');
            const accessToken = Cookies.get('accessToken')
            console.log(persistedAuth)
            console.log(persistedUserId)
            console.log(accessToken)
            if(persistedAuth === "true" && persistedUserId && accessToken){
                try{
                    await dispatch(fetchUserData(persistedUserId)).unwrap();
                } catch(error){
                   Cookies.remove('isAuthenticated');
                   Cookies.remove('userId');
                }
            }
            setInitialCheckDone(true);
        }
        checkAuth();
    },[dispatch])

    React.useEffect(() => {
        let interval;
        if (isAuthenticated && userData?.id) {
            const fetchData = async () => {
                try {
                    await dispatch(fetchUserData(userData.id)).unwrap();
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
           if(initialCheckDone){
               interval = setInterval(fetchData, 5 * 60 * 1000);
           }
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isAuthenticated, userData?.id, initialCheckDone , dispatch]);

    React.useEffect(() => {
        const handleStorageChange = () => {
            dispatch(restoreState());
        }
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        }
    },[dispatch]);

    if(!initialCheckDone){
        return null
    }

    return children;
};

export default AuthProvider;