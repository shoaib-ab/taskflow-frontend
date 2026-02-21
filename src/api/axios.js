import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Send httpOnly cookies with every request
});

// Response interceptor — transparently refreshes the access token when it expires.
// Flow:
//   1. A protected request returns 401 with code 'TOKEN_EXPIRED'
//   2. We call POST /auth/refresh (refresh token cookie is sent automatically)
//   3. The server sets a new access token cookie
//   4. We retry the original request — the new cookie is sent automatically
//   5. If the refresh also fails the user is redirected to /login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        await api.post('/auth/refresh');
        return api(originalRequest); // Retry with the new access token cookie
      } catch {
        // Refresh token is also expired / revoked — force re-login
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default api;
