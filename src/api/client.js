import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8001/api/v1', // Ensure backend is running
  timeout: 10000,

  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
