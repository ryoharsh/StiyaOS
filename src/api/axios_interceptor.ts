import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_HOST_URL || "http://localhost:3000",
  withCredentials: true, // <--- Cookie bhejne ke liye zaroori
});

async function refreshAccessToken() {
  const res = await api.get("/api/v1/auth/refresh");
  return res?.data?.data?.accessToken; // backend me jo bhi shape hai uske hisaab se
}

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom =>
    error ? prom.reject(error) : prom.resolve(token)
  );
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res, // normal case: just pass through
  async (err) => {
    const originalReq = err.config;

    // Agar access token expire ho gaya hai
    if (err.response?.status === 401 && !originalReq._retry) {
      if (isRefreshing) {
        // dusri requests wait karengi jab tak refresh chal raha hai
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalReq.headers["Authorization"] = `Bearer ${token}`;
          return api(originalReq);
        });
      }

      originalReq._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        if (!newToken) throw new Error("Unable to refresh");

        // Default header update karo
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        processQueue(null, newToken);

        // retry original request with new token
        originalReq.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalReq);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        throw refreshErr;
      } finally {
        isRefreshing = false;
      }
    }

    throw err;
  }
);
