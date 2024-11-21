// ปรับ AuthProvider ใหม่
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserData, restoreState } from '../../../redux/userSlice';
import Cookies from "js-cookie"

const AuthProvider = ({ children }) => {  // เปลี่ยนเป็น arrow function
    const dispatch = useDispatch();
    const { isAuthenticated, userData } = useSelector((state) => state.user);

    React.useEffect(() => {  // เพิ่ม React. ข้างหน้า useEffect
        const checkAuth = async () => {
            const persistedAuth = Cookies.get('isAuthenticated');
            const persistedUserId = Cookies.get('userId');
            if(persistedAuth === "true" && persistedUserId){
                try{
                    await dispatch(fetchUserData(persistedUserId)).unwrap();
                } catch(error){
                   Cookies.remove('isAuthenticated');
                   Cookies.remove('userId');
                }
            }
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
            fetchData();
            interval = setInterval(fetchData, 5 * 60 * 1000);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isAuthenticated, userData?.id, dispatch]);

    React.useEffect(() => {
        const handleStorageChange = () => {
            dispatch(restoreState());
        }
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        }
    },[dispatch]);

    return children;
};

export default AuthProvider;