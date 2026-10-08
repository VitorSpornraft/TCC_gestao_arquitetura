import axios from 'axios';

// Lê a URL do Render em produção. Se estiver rodando no seu PC, usa o localhost.
const urlConfigurada = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
export const API_BASE_URL = `${urlConfigurada}/api`;

// Conexão centralizada com o backend (Django)
const api = axios.create({
    baseURL: `${API_BASE_URL}/`,
});

// Inicialização imediata do header se já houver token no storage
const tokenInicial =
    localStorage.getItem('access') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('access') ||
    sessionStorage.getItem('token');
if (tokenInicial) {
    api.defaults.headers.common['Authorization'] = `Bearer ${tokenInicial}`;
}

// Remove qualquer header customizado X-Cliente-ID para prevenir falhas de preflight CORS
delete api.defaults.headers.common['X-Cliente-ID'];

// Interceptor para injetar o token JWT do arquiteto ou cliente automaticamente
api.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem('access') ||
            localStorage.getItem('token') ||
            sessionStorage.getItem('access') ||
            sessionStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
            if (typeof config.headers.set === 'function') {
                config.headers.set('Authorization', `Bearer ${token}`);
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

// --- AÇÕES DE APROVAÇÃO E FEEDBACK DE ARQUIVOS (SEM CABEÇALHO CUSTOMIZADO X-Cliente-ID) ---
export const aprovarArquivo = async (arquivoId, dados = {}) => {
    const clienteId = dados?.cliente_id || localStorage.getItem('cliente_id') || sessionStorage.getItem('cliente_id');
    const payload = {
        ...dados,
        ...(clienteId ? { cliente_id: clienteId } : {}),
    };
    const params = clienteId ? { cliente_id: clienteId } : {};
    const response = await api.post(`arquivos/${arquivoId}/aprovar/`, payload, { params });
    return response.data;
};

export const rejeitarArquivo = async (arquivoId, dados = {}) => {
    const clienteId = dados?.cliente_id || localStorage.getItem('cliente_id') || sessionStorage.getItem('cliente_id');
    const payload = {
        comentario: dados?.comentario || '',
        autor_nome: dados?.autor_nome || 'Cliente',
        ...(clienteId ? { cliente_id: clienteId } : {}),
    };
    const params = clienteId ? { cliente_id: clienteId } : {};
    const response = await api.post(`arquivos/${arquivoId}/rejeitar/`, payload, { params });
    return response.data;
};

export const adicionarFeedbackArquivo = async (arquivoId, dados = {}) => {
    const clienteId = dados?.cliente_id || localStorage.getItem('cliente_id') || sessionStorage.getItem('cliente_id');
    const payload = {
        comentario: dados?.comentario || '',
        autor_nome: dados?.autor_nome || 'Cliente',
        ...(clienteId ? { cliente_id: clienteId } : {}),
    };
    const params = clienteId ? { cliente_id: clienteId } : {};
    const response = await api.post(`arquivos/${arquivoId}/feedback/`, payload, { params });
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