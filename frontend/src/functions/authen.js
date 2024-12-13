import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const register = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/register`, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if(response.data.token){
            localStorage.setItem('token',response.date.token)
        }
        return response.data;
    } catch (error) {
        console.error('Error during registration:', error.response?.data || error.message);
        throw error;
    }
};

export const userLogin = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/login`, data, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
        return response.data; 
    } catch (error) {
        console.error('Error during login:', error.response?.data || error.message);
        throw error;
    }
};

export const userLogout = async () => {
    try{
        const response = await axios.post(`${API_URL}/logout`,{},{
            headers: {
                "Content-type":"application/json"
            },
            withCredentials: true
        })
        return response.data
    } catch(error){
        console.error('Error during logout', error.response?.data || error.message);
        throw error
    }
}

export const getUserData = async (id) => {
    try{
        const response = await axios.get(`${API_URL}/user/${id}/profile`,{
            headers:{
                "Content-type":"application/json"
            },
            withCredentials: true
        })
        console.log(response.data)
        return response.data
    } catch(error){
        console.error('Error fetching userData',error.response?.data || error.message);
    }
}

export const getRefreshToken = async () => {
    try{
        const response = await axios.post(`${API_URL}/refreshToken`,{},{
            headers:{
                "Content-Type": "application/json"
            },
            withCredentials: true
        })
        console.log('get refresh', response.data)
        return response.data.accessToken
    } catch(error){
        console.error('Error getting refresh token',error.response?.data || error.message);
    }
}