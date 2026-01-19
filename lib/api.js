// import axios from "axios";

// const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

// export const api = axios.create({
//   baseURL: API_BASE,
//   headers: {
//     "Content-Type": "application/json",
//   }
// });

// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach(prom => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
  
//   failedQueue = [];
// };

// /* Attach auth token to every request */
// api.interceptors.request.use(
//   (config) => {
//     if (typeof window !== "undefined") {
//       const token = localStorage.getItem("access_token");
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// /* Handle auth errors and token refresh */
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // If error is 401 and we haven't tried to refresh yet
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       if (isRefreshing) {
//         // If already refreshing, queue this request
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then(token => {
//             originalRequest.headers.Authorization = `Bearer ${token}`;
//             return api(originalRequest);
//           })
//           .catch(err => Promise.reject(err));
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       const refreshToken = localStorage.getItem("refresh_token");
      
//       if (!refreshToken) {
//         // No refresh token, logout
//         if (typeof window !== "undefined") {
//           localStorage.removeItem("access_token");
//           localStorage.removeItem("refresh_token");
//           localStorage.removeItem("user");
//           window.location.href = "/";
//         }
//         return Promise.reject(error);
//       }

//       try {
//         const response = await axios.post(`${API_BASE}/accounts/token/refresh/`, {
//           refresh: refreshToken
//         });

//         const newAccessToken = response.data.access;
//         localStorage.setItem("access_token", newAccessToken);
        
//         api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
//         processQueue(null, newAccessToken);
        
//         return api(originalRequest);
//       } catch (refreshError) {
//         processQueue(refreshError, null);
        
//         // Refresh failed, logout
//         if (typeof window !== "undefined") {
//           localStorage.removeItem("access_token");
//           localStorage.removeItem("refresh_token");
//           localStorage.removeItem("user");
//           window.location.href = "/";
//         }
        
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

function getSubdomain() {
  if (typeof window === "undefined") return null;

  const host = window.location.hostname; // e.g., school1.localhost or school1.example.com
  const parts = host.split('.');

  // If localhost: use a fake subdomain pattern like school1.localhost
  if (host.includes('localhost')) {
    // e.g., school1.localhost
    return parts.length === 2 ? parts[0] : null;
  }

  // For production: subdomain.example.com
  if (parts.length > 2) {
    return parts[0];
  }

  return null; // no subdomain
}


export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  }
});

// Attach auth token and X-School-ID dynamically
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // Attach JWT token if available
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Attach dynamic X-School-ID header (from subdomain)
      const subdomain = getSubdomain();
      if (subdomain) {
        config.headers['X-School-ID'] = subdomain;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
