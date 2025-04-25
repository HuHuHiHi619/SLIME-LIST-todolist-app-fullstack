import axios from "axios";

export const createTask = async (data) => {
  try {
    const response = await axios.post(`/task`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, 
    });

    console.log("Task created successfully:", response.data);
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

export const getData = async (filter) => {
  try {
    
    const response = await axios.get(`/task`, {
      params: filter,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, 
    });

    console.log("Task got successfully :", response.data);
    return response.data || [];
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

export const searchedTask = async (searchTerm) => {
  try {
    const response = await axios.get(`/task/searchTask?q=${searchTerm}`, {
      headers:{
        "Content-Type": "application/json"
      },
      withCredentials:true
    })
    console.log("Task searched successfully :", response.data);
    return response.data.tasks
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

export const completeTask = async (taskId) => {
  

  try {
    const response = await axios.patch(
      `/task/${taskId}/completed`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
  
   
    
    
    return { _id: taskId, ...response.data };
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

export const updateTask = async (id, data) => {
  console.log("SENT DATA", data);
  try {
    const response = await axios.put(`/task/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    console.log('response from api',response.data)
    return response.data;

  } catch (error) {
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    } else if (error.request) {
      console.error(
        "No response recieved from server:",
        error.response.request
      );
    } else {
      console.error("Axios error:", error.message);
    }
  }
};

export const removeTask = async (taskId) => {
  try {
    const response = await axios.delete(`/task/${taskId}/`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return { _id: taskId, ...response.data };
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

export const removeAllCompletedTask = async () => {
  try{
    const response = await axios.delete(`/completedTask`,{
      headers:{
        "Content-type": "application/json"
      },
      withCredentials: true
    })
    return response.data
  } catch(error){
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Axios error:", error.message);
    }
  }
}

export const updateTaskAttempt = async (taskId) => {
  try {
    const response = await axios.put(
      `/user/${taskId}/attempt`,
      {},
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    return { _id: taskId, ...response.data }; // ใช้ response.data
  } catch (error) {
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Axios error:", error.message);
    }
    throw error; // โยน error เพื่อจัดการเพิ่มเติมใน thunk
  }
};
