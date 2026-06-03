import axios from 'axios'

// Use env variable, fallback to production backend URL
const BASE_URL = import.meta.env.VITE_API_URL || 'https://freshmart-backend-er45.onrender.com/api'

const api = axios.create({
  baseURL: BASE_URL
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
