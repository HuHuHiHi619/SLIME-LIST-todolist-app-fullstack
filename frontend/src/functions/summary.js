import axios from "axios";

export const getSummaryTask = async () => {
  try {
    const response = await axios.get(`/summary/completed-rate`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    // แก้ไขตรงนี้ - ตรวจสอบ message ให้ถูกต้อง
    if (response.data.message === "No data found") {
      return [];
    }
    return response.data || [];
  } catch (error) {
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Axios error:", error.message);
    }
    throw error;
  }
};

export const getSummaryTaskByCategory = async () => {
  try {
    const response = await axios.get(`/summary/completed-rate-by-category`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    // แก้ไขตรงนี้ - ตรวจสอบ message ให้ถูกต้อง
    if (response.data.message === "No data found") {
      return [];
    }
    return response.data || [];
  } catch (error) {
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Axios error:", error.message);
    }
    throw error;
  }
};
export const getSummaryProgressRate = async (id) => {
  try {
    const response = await axios.get(`/summary/completed-progress-rate/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    if (response.data.message === "No tasks available") {
      return [];
    }
    return response.data || [];
  } catch (error) {
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Axios error:", error.message);
    }
    throw error;
  }
};

export const summaryNotification = async () => {
  try {
    const response = await axios.get(`/notification`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data || [];
  } catch (error) {
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Axios error:", error.message);
    }
    throw error;
  }
};
