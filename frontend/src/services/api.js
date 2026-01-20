import axios from 'axios'

const base = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8001'

const api = axios.create({
  baseURL: base,
  timeout: 5000,
})

// Attach Authorization header if token present
api.interceptors.request.use(cfg => {
  try{
    const raw = localStorage.getItem('trecker:token')
    if(raw){
      const token = JSON.parse(raw)
      cfg.headers = cfg.headers || {}
      cfg.headers.Authorization = `Bearer ${token}`
    }
  }catch(e){}
  return cfg
})

// Global response handler: if token expired/invalid, clear and redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    try{
      if(err.response && err.response.status === 401){
        localStorage.removeItem('trecker:token')
        localStorage.removeItem('trecker:user')
        window.location.hash = '#/login'
      }
    }catch(e){}
    return Promise.reject(err)
  }
)

export default api
