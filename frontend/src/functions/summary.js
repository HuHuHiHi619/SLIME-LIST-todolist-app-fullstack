import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const getSummaryTask = async () => {
    try{
        const response = await axios.get(`${API_URL}/summary/completed-rate`,{
            headers:{
                "Content-Type":"application/json",
            },
            withCredentials:true
        })
        if (response.data.message === 'No tasks available') {
            console.log("No tasks found.");
            return [];
          }
          return response.data || [];
    } catch (error){
        if (error.response) {
            console.error('Error response from server:', error.response.data);
          } else if (error.request) {
            console.error('No response received from server:', error.request);
          } else {
            console.error('Axios error:', error.message);
          }
    }
}

export const getSummaryTaskByCategory = async () => {
    try{
        const response = await axios.get(`${API_URL}/summary/completed-rate-by-category`,{
            headers:{
                "Content-Type":"application/json",
            },
            withCredentials:true
        })
        if (response.data.message === 'No tasks available') {
            console.log("No tasks found.");
            return [];
          }
          return response.data || [];
    } catch (error){
        if (error.response) {
            console.error('Error response from server:', error.response.data);
          } else if (error.request) {
            console.error('No response received from server:', error.request);
          } else {
            console.error('Axios error:', error.message);
          }
    }
}
export const getSummaryProgressRate = async (id) => {
    try{
        const response = await axios.get(`${API_URL}/summary/completed-progress-rate/${id}`,{
            headers:{
                "Content-Type":"application/json",
            },
            withCredentials:true
        })
        if (response.data.message === 'No tasks available') {
            console.log("No tasks found.");
            return [];
          }
          return response.data || [];
    } catch (error){
        if (error.response) {
            console.error('Error response from server:', error.response.data);
          } else if (error.request) {
            console.error('No response received from server:', error.request);
          } else {
            console.error('Axios error:', error.message);
          }
    }
}

export const summaryNotification = async () => {
  try{
     const response = await axios.get(`${API_URL}/notification`, {
      headers:{
        "Content-Type" : "application/json"
      },
      withCredentials:true
     })
     return response.data || []
  } catch(error){
    if (error.response) {
      console.error('Error response from server:', error.response.data);
    } else if (error.request) {
      console.error('No response received from server:', error.request);
    } else {
      console.error('Axios error:', error.message);
    }
  }
}