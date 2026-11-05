import axios from 'axios'
import { getToken } from './authToken'

axios.defaults.withCredentials = true
axios.defaults.baseURL = import.meta.env.VITE_API

axios.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default axios
