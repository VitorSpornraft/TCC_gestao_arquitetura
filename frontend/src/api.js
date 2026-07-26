import axios from 'axios';

// Criando a conexão central com o backend (Django)
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
});

export default api;