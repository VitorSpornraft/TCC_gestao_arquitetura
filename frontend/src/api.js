import axios from 'axios';

// Lê a URL do Render em produção. Se estiver rodando no seu PC, usa o localhost.
const urlConfigurada = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
export const API_BASE_URL = `${urlConfigurada}/api`;

// Conexão centralizada com o backend (Django)
const api = axios.create({
    baseURL: `${API_BASE_URL}/`,
});

// Interceptor para injetar o token JWT do arquiteto ou identificador do cliente automaticamente
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
            if (typeof config.headers.set === 'function') {
                config.headers.set('Authorization', `Bearer ${token}`);
            }
        }
        const clienteId = sessionStorage.getItem('cliente_id');
        if (clienteId) {
            config.headers = config.headers || {};
            config.headers['X-Cliente-ID'] = clienteId;
            if (typeof config.headers.set === 'function') {
                config.headers.set('X-Cliente-ID', clienteId);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- ATUALIZAÇÃO DE VISIBILIDADE DE ARQUIVOS E PASTAS ---
export const atualizarVisibilidadeArquivo = async (arquivoId, visivelCliente) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.patch(
        `arquivos/${arquivoId}/`,
        { visivel_cliente: visivelCliente },
        { headers }
    );
    return response.data;
};

export const atualizarVisibilidadePasta = async (pastaId, visivelCliente) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.patch(
        `pastas/${pastaId}/`,
        { visivel_cliente: visivelCliente },
        { headers }
    );
    return response.data;
};

// --- AUTENTICAÇÃO DO CLIENTE (PORTAL) ---
export const loginCliente = async ({ telefone, codigo, codigo_acesso }) => {
    const pin = (codigo_acesso || codigo || '').trim().toUpperCase();
    const response = await api.post('auth/cliente-login/', {
        telefone: (telefone || '').trim(),
        codigo: pin,
        codigo_acesso: pin,
    });
    return response.data;
};

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