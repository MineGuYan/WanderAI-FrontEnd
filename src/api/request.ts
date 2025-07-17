import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_BASE_URL
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authentication = token
        }
        return config
    },
    (error) => {
        // Handle request errors here
        return Promise.reject(error)
    }
)

api.interceptors.response.use(
    (response) => {
        // Handle successful responses here
        return response
    },
    (error) => {
        // Handle response errors here
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access, e.g., redirect to login
            console.error("Unauthorized access - redirecting to login")
        }
        return Promise.reject(error)
    }
)

export default api