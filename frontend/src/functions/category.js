import axios from "axios";


export const createCategory = async (data) => {
  console.log('Create cate sending:', data)
  try {
    const response = await axios.post(`/categories`, data, {
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
    const response = await axios.delete(`/categories/${categoryId}`,{
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
    const response = await axios.get(`/categories`,{
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
