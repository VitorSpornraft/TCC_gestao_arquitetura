import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { loginCliente } from '../../api';
import ClientLoginView from './ClientLoginView';
import ClientProjectList from './ClientProjectList';
import ClientFolderView from './ClientFolderView';
import { resolverArquivosVersaoRecente } from '../client-explorer/fileUtils';

export default function ClientPortal({
  clientes,
  projetos,
  pastas,
  arquivos,
  onVoltar,
  onAtualizarDados,
  onLoginSucesso,
  onLogout,
}) {
  const navigate = useNavigate();

  // --- ESTADOS DE SESSÃO E AUTENTICAÇÃO DO CLIENTE ---
  const [clienteLogado, setClienteLogado] = useState(() => {
    try {
      const salvo = localStorage.getItem('cliente_info') || sessionStorage.getItem('cliente_info');
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      return null;
    }
  });

  const [clienteId, setClienteId] = useState(() => {
    return localStorage.getItem('cliente_id') || sessionStorage.getItem('cliente_id') || null;
  });

  const [telefone, setTelefone] = useState('');
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [carregandoObras, setCarregandoObras] = useState(false);

  // --- ESTADOS DE DADOS DAS OBRAS E NAVEGAÇÃO ---
  // Lazy Initialization: leitura síncrona do sessionStorage para eliminar flicker ao voltar
  const [projetoAberto, setProjetoAberto] = useState(() => {
    try {
      const salvo = sessionStorage.getItem('cliente_projeto_ativo');
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      return null;
    }
  });

  const [projetosLocais, setProjetosLocais] = useState(() => {
    if (projetos && projetos.length > 0) return projetos;
    try {
      const salvo = localStorage.getItem('cliente_projetos');
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  });

  const [pastasLocais, setPastasLocais] = useState(() => {
    if (pastas && pastas.length > 0) return pastas;
    try {
      const salvo = localStorage.getItem('cliente_pastas');
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  });

  const [arquivosLocais, setArquivosLocais] = useState(() => {
    if (arquivos && arquivos.length > 0) return arquivos;
    try {
      const salvo = localStorage.getItem('cliente_arquivos');
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  });

  // --- BUSCA CENTRALIZADA DE OBRAS, PASTAS E ARQUIVOS (SEM X-CLIENTE-ID) ---
  const carregarObrasCliente = async (idParam) => {
    const idParaBuscar =
      idParam ||
      clienteId ||
      clienteLogado?.id ||
      localStorage.getItem('cliente_id') ||
      sessionStorage.getItem('cliente_id');

    if (!idParaBuscar) return;

    try {
      setCarregandoObras(true);
      const token =
        localStorage.getItem('access') ||
        localStorage.getItem('token') ||
        sessionStorage.getItem('access') ||
        sessionStorage.getItem('token');

      delete api.defaults.headers.common['X-Cliente-ID'];
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = { cliente_id: String(idParaBuscar) };

      const [resProjetos, resPastas, resArquivos] = await Promise.all([
        api.get('projetos/', { params, headers }),
        api.get('pastas/', { params, headers }),
        api.get('arquivos/', { params, headers }),
      ]);

      if (resProjetos?.data) {
        setProjetosLocais(resProjetos.data);
        localStorage.setItem('cliente_projetos', JSON.stringify(resProjetos.data));

        // Mantém atualizado o projeto aberto no sessionStorage com dados frescos
        let salvoAtivo = null;
        try {
          const s = sessionStorage.getItem('cliente_projeto_ativo');
          if (s) salvoAtivo = JSON.parse(s);
        } catch {
          salvoAtivo = null;
        }

        const alvo = projetoAberto || salvoAtivo;
        if (alvo) {
          const atualizado = resProjetos.data.find((p) => String(p.id) === String(alvo.id));
          if (atualizado) {
            setProjetoAberto(atualizado);
            sessionStorage.setItem('cliente_projeto_ativo', JSON.stringify(atualizado));
          }
        } else if (resProjetos.data.length === 1) {
          setProjetoAberto(resProjetos.data[0]);
          sessionStorage.setItem('cliente_projeto_ativo', JSON.stringify(resProjetos.data[0]));
        }
      }

      if (resPastas?.data) {
        setPastasLocais(resPastas.data);
        localStorage.setItem('cliente_pastas', JSON.stringify(resPastas.data));
      }

      if (resArquivos?.data) {
        setArquivosLocais(resArquivos.data);
        localStorage.setItem('cliente_arquivos', JSON.stringify(resArquivos.data));
      }
    } catch (err) {
      console.error('Erro ao buscar obras e pastas do cliente:', err);
    } finally {
      setCarregandoObras(false);
    }
  };

  // --- EFEITO DE INICIALIZAÇÃO NO MOUNT (F5) COM RECUPERAÇÃO DO LOCALSTORAGE ---
  useEffect(() => {
    const token =
      localStorage.getItem('access') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('access') ||
      sessionStorage.getItem('token');

    const idArmazenado =
      localStorage.getItem('cliente_id') ||
      sessionStorage.getItem('cliente_id');

    const infoStorage =
      localStorage.getItem('cliente_info') ||
      sessionStorage.getItem('cliente_info');

    // 1. Verifique se existe token e clienteId válidos no localStorage/sessionStorage
    if (token && idArmazenado) {
      delete api.defaults.headers.common['X-Cliente-ID'];
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      let parsedInfo = null;
      if (infoStorage) {
        try {
          parsedInfo = JSON.parse(infoStorage);
        } catch (e) {
          console.error('Erro ao fazer parse de cliente_info:', e);
        }
      }

      const clienteRecuperado = parsedInfo || { id: idArmazenado, nome: 'Cliente' };
      setClienteId(idArmazenado);
      setClienteLogado(clienteRecuperado);

      // 2. Dispara o fetch imediatamente para buscar dados frescos no Django e matar cache obsoleto
      carregarObrasCliente(idArmazenado);

      if (onAtualizarDados) {
        onAtualizarDados();
      }
    } else {
      const idFallback = clienteId || clienteLogado?.id;
      if (idFallback) {
        carregarObrasCliente(idFallback);
        if (onAtualizarDados) {
          onAtualizarDados();
        }
      }
    }
  }, []);

  // Sincronização com dados passados pelo workspace
  useEffect(() => {
    if (arquivos && arquivos.length > 0) setArquivosLocais(arquivos);
  }, [arquivos]);

  useEffect(() => {
    if (projetos && projetos.length > 0) setProjetosLocais(projetos);
  }, [projetos]);

  useEffect(() => {
    if (pastas && pastas.length > 0) setPastasLocais(pastas);
  }, [pastas]);

  // --- HANDLERS DE AÇÃO E NAVEGAÇÃO ---
  const handleAcessoProjeto = (projeto) => {
    setProjetoAberto(projeto);
    if (projeto) {
      sessionStorage.setItem('cliente_projeto_ativo', JSON.stringify(projeto));
    } else {
      sessionStorage.removeItem('cliente_projeto_ativo');
    }
  };

  const handleVoltarProjetos = () => {
    setProjetoAberto(null);
    sessionStorage.removeItem('cliente_projeto_ativo');
  };

  const handleCliqueArquivo = (arq) => {
    if (!arq) return;
    navigate(`/portal/arquivo/${arq.id}`, { state: { arquivo: arq } });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');

    const telLimpo = (telefone || '').trim();
    const codigoLimpo = (codigo || '').trim().toUpperCase();

    if (!telLimpo || !codigoLimpo) {
      setErro('Código de acesso ou telefone inválidos.');
      return;
    }

    setCarregando(true);

    try {
      const data = await loginCliente({
        telefone: telLimpo,
        codigo_acesso: codigoLimpo,
        codigo: codigoLimpo,
      });

      if (data && (data.cliente || data.user)) {
        const clienteInfo = data.cliente || {
          id: data.user.cliente_id || data.user.id,
          nome: data.user.nome || data.user.first_name || 'Cliente',
          ...data.user,
        };

        const token = data.access;
        const idSalvo = String(clienteInfo.id);

        localStorage.setItem('userRole', 'cliente');
        sessionStorage.setItem('userRole', 'cliente');

        if (token) {
          localStorage.setItem('token', token);
          sessionStorage.setItem('token', token);
          localStorage.setItem('access', token);
          sessionStorage.setItem('access', token);
        }
        if (data.refresh) {
          localStorage.setItem('refresh', data.refresh);
          sessionStorage.setItem('refresh', data.refresh);
        }

        localStorage.setItem('cliente_id', idSalvo);
        sessionStorage.setItem('cliente_id', idSalvo);
        localStorage.setItem('cliente_info', JSON.stringify(clienteInfo));
        sessionStorage.setItem('cliente_info', JSON.stringify(clienteInfo));

        delete api.defaults.headers.common['X-Cliente-ID'];
        if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        await carregarObrasCliente(idSalvo);

        if (data.projetos) {
          setProjetosLocais(data.projetos);
          localStorage.setItem('cliente_projetos', JSON.stringify(data.projetos));
          if (data.projetos.length === 1) {
            setProjetoAberto(data.projetos[0]);
          }
        }
        if (data.pastas) {
          setPastasLocais(data.pastas);
          localStorage.setItem('cliente_pastas', JSON.stringify(data.pastas));
        }
        if (data.arquivos) {
          setArquivosLocais(data.arquivos);
          localStorage.setItem('cliente_arquivos', JSON.stringify(data.arquivos));
        }

        setClienteId(idSalvo);
        setClienteLogado(clienteInfo);

        if (onLoginSucesso) onLoginSucesso(clienteInfo);
        if (onAtualizarDados) onAtualizarDados();
        return;
      }
      setErro('Código de acesso ou telefone inválidos.');
    } catch (apiError) {
      const telDigitado = telLimpo.replace(/\D/g, '');

      // Fallback offline estrito
      if (!apiError.response && clientes && clientes.length > 0) {
        const clienteEncontrado = clientes.find((c) => {
          const codigoBate = (c.codigo_acesso || '').trim().toUpperCase() === codigoLimpo;
          if (!codigoBate) return false;

          const telBanco = (c.telefone || '').replace(/\D/g, '');
          const dddBanco = (c.ddd || '').replace(/\D/g, '');
          const digitouComDDD = telDigitado === `${dddBanco}${telBanco}`;
          const digitouSoNumero = telDigitado === telBanco;
          const sufixoBate = telDigitado.length >= 8 && `${dddBanco}${telBanco}`.endsWith(telDigitado);

          return digitouComDDD || digitouSoNumero || sufixoBate;
        });

        if (clienteEncontrado) {
          const cId = String(clienteEncontrado.id);
          localStorage.setItem('userRole', 'cliente');
          sessionStorage.setItem('userRole', 'cliente');
          localStorage.setItem('cliente_id', cId);
          sessionStorage.setItem('cliente_id', cId);
          localStorage.setItem('cliente_info', JSON.stringify(clienteEncontrado));
          sessionStorage.setItem('cliente_info', JSON.stringify(clienteEncontrado));
          setClienteId(cId);
          setClienteLogado(clienteEncontrado);
          setErro('');
          if (onLoginSucesso) onLoginSucesso(clienteEncontrado);
          carregarObrasCliente(cId);
          return;
        }
      }

      setErro('Código de acesso ou telefone inválidos.');
    } finally {
      setCarregando(false);
    }
  };

  const handleVoltar = () => {
    delete api.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['X-Cliente-ID'];
    sessionStorage.removeItem('cliente_projeto_ativo');
    localStorage.removeItem('userRole');
    sessionStorage.removeItem('userRole');
    localStorage.removeItem('cliente_id');
    sessionStorage.removeItem('cliente_id');
    localStorage.removeItem('cliente_info');
    sessionStorage.removeItem('cliente_info');
    localStorage.removeItem('cliente_projetos');
    localStorage.removeItem('cliente_pastas');
    localStorage.removeItem('cliente_arquivos');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('access');
    sessionStorage.removeItem('access');
    localStorage.removeItem('refresh');
    sessionStorage.removeItem('refresh');
    setClienteLogado(null);
    setClienteId(null);
    setProjetosLocais([]);
    setPastasLocais([]);
    setArquivosLocais([]);
    setProjetoAberto(null);
    if (onVoltar) onVoltar();
  };

  const handleLogout = () => {
    delete api.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['X-Cliente-ID'];
    sessionStorage.removeItem('cliente_projeto_ativo');
    localStorage.removeItem('userRole');
    sessionStorage.removeItem('userRole');
    localStorage.removeItem('cliente_id');
    sessionStorage.removeItem('cliente_id');
    localStorage.removeItem('cliente_info');
    sessionStorage.removeItem('cliente_info');
    localStorage.removeItem('cliente_projetos');
    localStorage.removeItem('cliente_pastas');
    localStorage.removeItem('cliente_arquivos');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('access');
    sessionStorage.removeItem('access');
    localStorage.removeItem('refresh');
    sessionStorage.removeItem('refresh');
    setClienteLogado(null);
    setClienteId(null);
    setProjetosLocais([]);
    setPastasLocais([]);
    setArquivosLocais([]);
    setProjetoAberto(null);
    if (onLogout) onLogout();
  };

  // --- FILTRAGEM DOS DADOS PARA O DASHBOARD DO CLIENTE ---
  const listaProjetos = projetosLocais.length > 0 ? projetosLocais : (projetos || []);
  const listaPastas = pastasLocais.length > 0 ? pastasLocais : (pastas || []);
  const listaArquivos = arquivosLocais.length > 0 ? arquivosLocais : (arquivos || []);

  const idAtual = clienteId || clienteLogado?.id || localStorage.getItem('cliente_id') || sessionStorage.getItem('cliente_id');
  const meusProjetos = listaProjetos.filter((p) => {
    if (!idAtual) return true;
    const pClienteId = typeof p.cliente === 'object' ? p.cliente?.id : p.cliente;
    if (pClienteId !== undefined && pClienteId !== null) {
      return String(pClienteId) === String(idAtual);
    }
    return true;
  });

  // --- CONTROLE DE RENDERIZAÇÃO LIMPO (SRP) ---

  // 1. Não autenticado: Exibe tela de login do cliente
  if (!clienteLogado) {
    return (
      <ClientLoginView
        telefone={telefone}
        setTelefone={setTelefone}
        codigo={codigo}
        setCodigo={setCodigo}
        erro={erro}
        carregando={carregando}
        onSubmit={handleLogin}
        onVoltar={handleVoltar}
      />
    );
  }

  // 2. Projeto Aberto: Exibe tela de documentos e pastas da obra selecionada
  if (projetoAberto) {
    const pastasVisiveis = listaPastas
      .filter(
        (p) =>
          String(typeof p.projeto === 'object' ? p.projeto?.id : p.projeto) === String(projetoAberto.id) &&
          p.visivel_cliente
      )
      .sort(
        (a, b) =>
          (a.nome || '').localeCompare(b.nome || '', undefined, {
            sensitivity: 'base',
          }) || Number(a.id || 0) - Number(b.id || 0)
      );
    const arquivosDaObra = listaArquivos.filter(
      (a) =>
        String(typeof a.projeto === 'object' ? a.projeto?.id : a.projeto) === String(projetoAberto.id)
    );
    const arquivosMaisRecentes = resolverArquivosVersaoRecente(arquivosDaObra);
    const arquivosVisiveis = arquivosMaisRecentes
      .filter((a) => a.visivel_cliente)
      .sort((a, b) => {
        const nomeA = a.nome || a.arquivo || '';
        const nomeB = b.nome || b.arquivo || '';
        return (
          nomeA.localeCompare(nomeB, undefined, { sensitivity: 'base' }) ||
          Number(a.id || 0) - Number(b.id || 0)
        );
      });

    return (
      <ClientFolderView
        projeto={projetoAberto}
        pastas={pastasVisiveis}
        arquivos={arquivosVisiveis}
        onVoltarProjetos={handleVoltarProjetos}
        onCliqueArquivo={handleCliqueArquivo}
      />
    );
  }

  // 3. Padrão: Exibe lista inicial de obras vinculadas ao cliente
  return (
    <ClientProjectList
      clienteLogado={clienteLogado}
      projetos={meusProjetos}
      carregandoObras={carregandoObras}
      onSelecionarProjeto={handleAcessoProjeto}
      onAcessoProjeto={handleAcessoProjeto}
      onLogout={handleLogout}
    />
  );
}
