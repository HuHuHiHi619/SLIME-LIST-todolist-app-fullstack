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
        console.log(response)
        return response.data; 
    } catch (error) {
        console.error('Error during login:', error.response?.data || error.message);
        throw error;
    }
};
