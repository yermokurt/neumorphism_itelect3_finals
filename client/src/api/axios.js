// src/api/axios.js — Axios instance with JWT auth headers
import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('postpal_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
