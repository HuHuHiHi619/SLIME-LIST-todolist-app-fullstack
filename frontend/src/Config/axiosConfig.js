import axios from 'axios';
// import { getRefreshToken } from './functions/authen'; // ไม่ต้อง import function นี้แล้ว เรียกตรงๆ แทน
import store from '../redux/store';
import { logoutUser } from '../redux/userSlice';
import API_URL from './apiConfig';
console.log("--- Global Axios Config File Executing ---");
// --- ตั้งค่า baseURL และ withCredentials สำหรับ global axios ---
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';


// --- Logic จัดการ Refresh Token ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
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

    // !!! ตรวจสอบให้แน่ใจว่า URL เทียบเคียงถูกต้อง !!!
    // ตัวอย่าง ถ้า baseURL คือ http://localhost:5000 URL ใน config จะเป็น /api/user/profile
    // originalRequest.url จะเป็น /api/user/profile
    // API_URL + '/refreshToken' จะเป็น http://localhost:5000/refreshToken
    // ต้องเช็คเทียบกับ originalRequest.url ที่ไม่มี baseURL
    const refreshTokenUrl = '/refreshToken'; // ใช้ path สัมพัทธ์

    // เช็ค 401 และไม่ใช่การ retry หรือเรียก /refreshToken
    if (error.response?.status === 401 && originalRequest.url !== refreshTokenUrl && !originalRequest._retry) {

      console.log('Interceptor: Caught 401.', originalRequest.url);

      if (isRefreshing) {
        // ถ้ากำลัง Refresh อยู่ ให้รอในคิว
        console.log('Interceptor: Refresh already in progress. Queueing original request.');
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then(() => {
            // เมื่อ Refresh เสร็จ ให้ retry Request เดิม
            originalRequest._retry = true; // Mark เป็น request ที่ retry แล้ว
            console.log('Interceptor: Retrying original request after successful refresh.');
            return axios(originalRequest); // ใช้ global axios เดิม (มันจะแนบ cookie ใหม่ไปเอง)
        })
        .catch(err => {
            console.error('Interceptor: Retry failed after refresh.', err);
            return Promise.reject(err); // ถ้า Retry ล้มเหลว ให้ reject promise เดิม
        });
      }

      // ถ้ายังไม่มีการ Refresh ให้เริ่มกระบวนการ
      originalRequest._retry = true; // Mark Request เดิมว่ากำลังจะถูก Retry
      isRefreshing = true;
      console.log('Interceptor: Starting refresh process...');

      try {
        // *** เรียก /refreshToken Endpoint โดยตรง ***
        // ใช้ axios ปกติได้เลย แต่ต้องแน่ใจว่า Endpoint นี้จะไม่โดน Interceptor ตัวนี้ซ้ำ
        // การเช็ค originalRequest.url !== refreshTokenUrl ที่ด้านบนช่วยป้องกันแล้ว
        const refreshResponse = await axios.post(refreshTokenUrl, {}, {
           // ไม่ต้องใส่ withCredentials: true ตรงนี้ ถ้าตั้งเป็น default ที่ axios.defaults แล้ว
           // ไม่ต้องใส่ headers: Content-Type ตรงนี้ ถ้าตั้งเป็น default แล้ว
           // *** ไม่ต้องสร้าง axios instance ใหม่ *** ใช้ตัว global ได้เลย เพราะเช็ค URL ไว้แล้ว
        });

        console.log('Interceptor: Refresh token call successful.');
        // Backend /refreshToken ควรจะตั้งค่า Access Token cookie ใหม่ให้แล้วโดยอัตโนมัติเมื่อสำเร็จ (200)
        // ไม่ต้องทำอะไรกับ response.data.accessToken ใน Frontend เพื่อ Retry
        // Browser จะจัดการ cookie ใหม่เอง

        processQueue(null); // แจ้งคิวว่า Refresh สำเร็จแล้ว
        isRefreshing = false;

        console.log('Interceptor: Token refreshed successfully. Retrying original request...');
        return axios(originalRequest); // Retry Request เดิม (Browser จะใช้ cookie ใหม่)

      } catch (refreshError) {
        // --- !!! ถ้าเรียก /refreshToken Endpoint แล้วล้มเหลว !!! ---
        console.error('Interceptor: Failed to refresh token:', refreshError.message);
        console.error('Interceptor: Refresh Error Response:', refreshError.response); // ดู Error Response จาก Backend /refreshToken

        processQueue(refreshError); // แจ้งคิวว่า Refresh ล้มเหลว
        isRefreshing = false;

        // *** Dispatch Logout User ***
        // ถ้า Refresh Token ใช้ไม่ได้แล้ว ให้ Logout ผู้ใช้
        console.log('Interceptor: Refresh failed. Dispatching logoutUser.');
        store.dispatch(logoutUser());

        // Reject promise ของ Request เดิม
        return Promise.reject(refreshError || error);
      }
    }

    // ถ้าไม่ใช่ 401 หรือเป็น Request ที่ Interceptor ไม่ควรจัดการ ให้ผ่านไป
    // console.log('Interceptor: Passing through response/error.'); // Log เยอะไป เอาออก
    return Promise.reject(error); // ถ้าไม่ใช่ 401 หรือเป็น Error อื่นๆ ก็ Reject ตามปกติ
  }
);