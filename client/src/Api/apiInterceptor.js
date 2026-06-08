import axios from "axios";

const backend_URL =
  import.meta.env.VITE_REACT_APP_BACKEND_URL || "http://localhost:5000";

// function to find cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) return parts.pop().split(";").shift();
};

// DS for csrf token
let isRefreshingCSRF = false;
let csrfFailedQueue = [];

// Process queue for CSRF
const processQueueCSRF = (error, token = null) => {
  csrfFailedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  csrfFailedQueue = [];
};

// DS for refresh access token
let isRefreshing = false;
let failedQueue = [];

// Process queue for access token
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// make a general API for authenticated request
const api = axios.create({
  baseURL: backend_URL,
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (
      config.method === "post" ||
      config.method === "put" ||
      config.method === "delete"
    ) {
      const csrfToken = getCookie("csrfToken");

      if (csrfToken) {
        config.headers["x-csrf-token"] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const errorCode = error.response?.data?.code || "";

    // Handle CSRF refresh
    if (
      status === 403 &&
      errorCode.startsWith("CSRF_") &&
      !originalRequest._retry
    ) {
      // set retry true
      originalRequest._retry = true;

      // if the csrf token is refreshing then put all the incoming request in queue
      if (isRefreshingCSRF) {
        return new Promise((resolve, reject) => {
          csrfFailedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        });
      }

      // when refresh compete set flag to true
      isRefreshingCSRF = true;

      // when first request whose csrf token expires then call the refresh-csrf to generate a new token
      try {
        await api.post("/api/auth/refresh-csrf");
        processQueueCSRF(null);
        return api(originalRequest);
      } catch (error) {
        processQueueCSRF(error, null);
        return Promise.reject(error);
      } finally {
        isRefreshingCSRF = false;
      }
    }

    // Handle Access Token
    if (
      status === 401 &&
      errorCode.startsWith("ACCESS_TOKEN_") &&
      !originalRequest._retry
    ) {
      // set retry true
      originalRequest._retry = true;

      // if the access token is refreshing then put all the incoming request in queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        });
      }

      // when refresh compete set flag to true
      isRefreshing = true;

      // when first request whose access token expires then call the refresh to generate a new token
      try {
        await api.post("/api/auth/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (error) {
        processQueue(error, null);
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // if no such occurs then reject the req
    return Promise.reject(error);
  },
);

export default api;
