import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const getTagData = async () => {
  try{
    const response = await axios.get(`${API_URL}/tags`,{
      headers: {
        "Content-Type": "application/json"
      },
      withCredentials: true,
    })
    console.log("Tag got successfully:", response.data);
    return response.data
  } catch(error) {
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Axios error:", error.message);
    }
  }
}

export const createTag = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/tags`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    console.log("Tag created successfully:", response.data);
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

export const removeTag = async (tagId) => {
  try{
    const response = await axios.delete(`${API_URL}/tags/${tagId}`,{
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