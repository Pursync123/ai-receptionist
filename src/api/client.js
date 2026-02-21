import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,

  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
