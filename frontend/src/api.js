import axios from 'axios';

// Lê a URL do Render em produção. Se estiver rodando no seu PC, usa o localhost.
const urlConfigurada = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
export const API_BASE_URL = `${urlConfigurada}/api`;

// Conexão centralizada com o backend (Django)
const api = axios.create({
    baseURL: `${API_BASE_URL}/`,
});

// Interceptor para injetar o token JWT automaticamente em todas as requisições autenticadas
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- AÇÕES DE APROVAÇÃO E FEEDBACK DE ARQUIVOS ---
export const aprovarArquivo = async (arquivoId) => {
    const response = await api.post(`arquivos/${arquivoId}/aprovar/`);
    return response.data;
};

export const rejeitarArquivo = async (arquivoId, { comentario, autor_nome = 'Cliente' }) => {
    const response = await api.post(`arquivos/${arquivoId}/rejeitar/`, { comentario, autor_nome });
    return response.data;
};

export const adicionarFeedbackArquivo = async (arquivoId, { comentario, autor_nome = 'Cliente' }) => {
    const response = await api.post(`arquivos/${arquivoId}/feedback/`, { comentario, autor_nome });
    return response.data;
};

// --- FLUXOS DE AUTENTICAÇÃO COM OTP (ATIVAÇÃO E RECUPERAÇÃO) ---
export const ativarConta = async ({ email, codigo }) => {
    const response = await api.post('auth/ativar-conta/', { email, codigo });
    return response.data;
};

export const solicitarRecuperacaoSenha = async ({ email }) => {
    const response = await api.post('auth/esqueci-senha/', { email });
    return response.data;
};

export const redefinirSenha = async ({ email, codigo, nova_senha }) => {
    const response = await api.post('auth/redefinir-senha/', { email, codigo, nova_senha });
    return response.data;
};

export default api;