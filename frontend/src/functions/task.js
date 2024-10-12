import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const createTask = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/task`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // ทำให้ cookie ถูกส่ง
    });

      console.log("Task created successfully:", response.data);
      return response.data;
    
  } catch (error) {
    if (error.response) {
      console.error('Error response from server:', error.response.data);
    } else if (error.request) {
      console.error('No response received from server:', error.request);
    } else {
      console.error('Axios error:', error.message);
    }
  }
};


export const getData = async (filter) => {
  try {
    const response = await axios.get(`${API_URL}/task`, {
      params: filter,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // ทำให้ cookie ถูกส่ง
    });

      console.log("Task got successfully:", response.data);
      return response.data;
    
  } catch (error) {
    if (error.response) {
      console.error('Error response from server:', error.response.data);
    } else if (error.request) {
      console.error('No response received from server:', error.request);
    } else {
      console.error('Axios error:', error.message);
    }
  }
};

export const completedTask = async (taskId) => {
  try {
    const response = await axios.patch(`${API_URL}/task/${taskId}/completed`, {} , { 
      headers: {
        "Content-Type": 'application/json',
      },
      withCredentials: true, // ต้องให้แน่ใจว่าส่ง cookies
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error response from server:', error.response.data);
    } else if (error.request) {
      console.error('No response received from server:', error.request);
    } else {
      console.error('Axios error:', error.message);
    }
  }
};

export const updateTask = async (id, data) => {
  try{
    const response = await axios.put(`${API_URL}/task/${id}`, data ,{
      headers:{
        "Content-Type": "application/json",
      },
      withCredentials:true
    });
    return response.data;
  } catch(error){
    if(error.response){
      console.error('Error response from server:',error.response.data);
    } else if(error.request){
      console.error('No response recieved from server:',error.response.request);
    } else {
      console.error('Axios error:',error.message)
    }
  } 
};

export const removeTask = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/task/${id}/`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response;
  } catch (error) {
    if (error.response) {
      console.error('Error response from server:', error.response.data);
    } else if (error.request) {
      console.error('No response received from server:', error.request);
    } else {
      console.error('Axios error:', error.message);
    }
  }
};

 




export const getImageUrl = (path) => `${import.meta.env.VITE_URL}${path}`;
