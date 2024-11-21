import { useEffect } from 'react'
import {  useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';


function ProtectedRoute ({children}) {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.user);
    
    useEffect(() => {
        if(!isAuthenticated){
            navigate('/login')
        }
       
    },[isAuthenticated,navigate])
    
    return isAuthenticated ? children : null 

}

export default ProtectedRoute
