import axios from "axios";
// import { getRefreshToken } from './functions/authen'; // ไม่ต้อง import function นี้แล้ว เรียกตรงๆ แทน
import store from "../redux/store";
import { logoutUser } from "../redux/userSlice";

console.log("--- Global Axios Config File Executing ---");
// --- ตั้งค่า baseURL และ withCredentials สำหรับ global axios ---

const apiBaseUrl = import.meta.env.MODE === 'development' 
  ? import.meta.env.VITE_LOCAL_API_URL
  : '/api'

axios.defaults.baseURL = apiBaseUrl;
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Content-Type"] = "application/json";

// --- Logic จัดการ Refresh Token ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(); // ไม่ต้องส่ง token, การ retry จะใช้ cookie ใหม่
    }
  });
  failedQueue = [];
};

// *** แนบ Interceptor เข้ากับ Global Axios ***
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const refreshTokenUrl = "/refreshToken";

    // เช็ค 401 และไม่ใช่การ retry หรือเรียก /refreshToken
    if (
      error.response?.status === 401 &&
      originalRequest.url !== refreshTokenUrl &&
      !originalRequest._retry
    ) {
      console.log("Interceptor: Caught 401.", originalRequest.url);

      if (isRefreshing) {
        // ถ้ากำลัง Refresh อยู่ ให้รอในคิว
        console.log(
          "Interceptor: Refresh already in progress. Queueing original request."
        );
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // เมื่อ Refresh เสร็จ ให้ retry Request เดิม
            originalRequest._retry = true; // Mark เป็น request ที่ retry แล้ว
            console.log(
              "Interceptor: Retrying original request after successful refresh."
            );
            return axios(originalRequest); // ใช้ global axios เดิม (มันจะแนบ cookie ใหม่ไปเอง)
          })
          .catch((err) => {
            console.error("Interceptor: Retry failed after refresh.", err);
            return Promise.reject(err); // ถ้า Retry ล้มเหลว ให้ reject promise เดิม
          });
      }

      // ถ้ายังไม่มีการ Refresh ให้เริ่มกระบวนการ
      originalRequest._retry = true; // Mark Request เดิมว่ากำลังจะถูก Retry
      isRefreshing = true;
      console.log("Interceptor: Starting refresh process...");

      try {
        const refreshResponse = await axios.post(refreshTokenUrl, {}, {});

        console.log("Interceptor: Refresh token call successful.");

        processQueue(null); // แจ้งคิวว่า Refresh สำเร็จแล้ว
        isRefreshing = false;

        console.log(
          "Interceptor: Token refreshed successfully. Retrying original request..."
        );
        return axios(originalRequest); // Retry Request เดิม (Browser จะใช้ cookie ใหม่)
      } catch (refreshError) {
        // --- !!! ถ้าเรียก /refreshToken Endpoint แล้วล้มเหลว !!! ---
        console.error(
          "Interceptor: Failed to refresh token:",
          refreshError.message
        );
        console.error(
          "Interceptor: Refresh Error Response:",
          refreshError.response
        ); // ดู Error Response จาก Backend /refreshToken

        processQueue(refreshError); // แจ้งคิวว่า Refresh ล้มเหลว
        isRefreshing = false;

        // *** Dispatch Logout User ***
        // ถ้า Refresh Token ใช้ไม่ได้แล้ว ให้ Logout ผู้ใช้
        console.log("Interceptor: Refresh failed. Dispatching logoutUser.");
        store.dispatch(logoutUser());

        // Reject promise ของ Request เดิม
        return Promise.reject(refreshError || error);
      }
    }

    return Promise.reject(error);
  }
);
