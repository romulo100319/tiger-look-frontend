import axios from 'axios';

// 🕵️‍♂️ Debug Line: Check this in your browser console!
console.log("Current API URL:", import.meta.env.VITE_API_URL);

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api', 
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;