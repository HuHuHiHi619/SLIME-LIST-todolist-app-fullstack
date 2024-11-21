import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const createCategory = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/categories`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    console.log("Category created successfully:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Axios error:", error.message);
    }
  }
};

export const removeCategory = async (categoryId) => {
  try{
    const response = await axios.delete(`${API_URL}/categories/${categoryId}`,{
      headers:{
        "Content-Type":"application/json"
      },
      withCredentials: true
    })
    return response.data
  } catch(error){
    if(error.response){
      console.error("Error response from server:", error.response.data)
    } else if(error.resquest){
      console.error("No response received from server:",error.request)
    } else {
      console.error("Axios error:", error.message)
    }
  }
}

export const getCategoryData = async () => {
  try{
    const response = await axios.get(`${API_URL}/categories`,{
      headers: {
        "Content-Type":"application/json",
      },
      withCredentials:true
    })
    console.log("Category got successfully:", response.data);
    return response.data
  } catch(error){
    if(error.response){
      console.error('Error response from server:', error.response.data);
    } else if(error.request){
      console.error('No response recieved from server:',error.request);
    } else {
      console.error('Axios Error:',error.message)
    }
  }
}
