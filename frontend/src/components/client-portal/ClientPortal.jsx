import { useState, useEffect } from 'react';
import { getFileUrl, formatarNomeArquivo, isArquivoPdf, isArquivoImagem } from '../client-explorer/fileUtils';
import ApprovalStatusBadge from '../common/ApprovalStatusBadge';
import ClientFileViewerModal from './ClientFileViewerModal';
import { loginCliente } from '../../api';

export default function ClientPortal({ clientes, projetos, pastas, arquivos, onVoltar, onAtualizarDados }) {
  const [clienteLogado, setClienteLogado] = useState(null);
  const [telefone, setTelefone] = useState('');
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const [projetoAberto, setProjetoAberto] = useState(null);
  const [arquivoModal, setArquivoModal] = useState(null);
  const [projetosLocais, setProjetosLocais] = useState(projetos || []);
  const [pastasLocais, setPastasLocais] = useState(pastas || []);
  const [arquivosLocais, setArquivosLocais] = useState(arquivos || []);

  useEffect(() => {
    if (arquivos && arquivos.length > 0) setArquivosLocais(arquivos);
  }, [arquivos]);

  useEffect(() => {
    if (projetos && projetos.length > 0) setProjetosLocais(projetos);
  }, [projetos]);

  useEffect(() => {
    if (pastas && pastas.length > 0) setPastasLocais(pastas);
  }, [pastas]);

  const handleArquivoAtualizado = (arqAtualizado) => {
    setArquivosLocais((prev) =>
      prev.map((a) => (a.id === arqAtualizado.id ? arqAtualizado : a))
    );
    setArquivoModal(arqAtualizado);
    if (onAtualizarDados) onAtualizarDados();
  };

  // --- CONTROLE DE CLIQUE E PRÉ-VISUALIZAÇÃO DE ARQUIVOS ---
  const handleCliqueArquivo = (arq) => {
    if (!arq) return;
    setArquivoModal(arq);
  };

  // --- LÓGICA DE LOGIN DO CLIENTE (Com autenticação na API e fallback seguro) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      // 1. Tenta autenticação direta na API Django REST (retorna dados isolados do cliente)
      const data = await loginCliente({ telefone, codigo });
      if (data && data.cliente) {
        if (data.access) {
          sessionStorage.setItem('token', data.access);
        }
        sessionStorage.setItem('cliente_id', data.cliente.id);
        setClienteLogado(data.cliente);
        if (data.projetos) setProjetosLocais(data.projetos);
        if (data.pastas) setPastasLocais(data.pastas);
        if (data.arquivos) setArquivosLocais(data.arquivos);
        return;
      }
    } catch (apiError) {
      // 2. Se a API estiver offline ou dados já estiverem pré-carregados nas props, tenta validação local
      const telDigitado = telefone.replace(/\D/g, '');

      const clienteEncontrado = (clientes || []).find((c) => {
        const telBanco = (c.telefone || '').replace(/\D/g, '');
        const dddBanco = (c.ddd || '').replace(/\D/g, '');

        const digitouComDDD = telDigitado === `${dddBanco}${telBanco}`;
        const digitouSoNumero = telDigitado === telBanco;

        const telefoneBate = digitouComDDD || digitouSoNumero;
        const codigoBate = (c.codigo_acesso || '').trim().toUpperCase() === codigo.trim().toUpperCase();

        return telefoneBate && codigoBate;
      });

      if (clienteEncontrado) {
        sessionStorage.setItem('cliente_id', clienteEncontrado.id);
        setClienteLogado(clienteEncontrado);
        setErro('');
      } else {
        const msgApi = apiError.response?.data?.erro;
        setErro(msgApi || 'Telefone ou código de acesso inválidos.');
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleVoltar = () => {
    sessionStorage.removeItem('cliente_id');
    sessionStorage.removeItem('token');
    setClienteLogado(null);
    if (onVoltar) onVoltar();
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cliente_id');
    sessionStorage.removeItem('token');
    setClienteLogado(null);
    setProjetoAberto(null);
  };

  // --- TELA DE LOGIN ---
  if (!clienteLogado) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-center items-center p-6 font-sans animate-fadeIn">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight text-center">Portal do Cliente</h2>
          <p className="mt-2 text-sm text-slate-500 text-center">Acompanhe o andamento dos seus projetos</p>
        </div>

        <div className="w-full max-w-md mt-8 bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Telefone</label>
              <input
                type="text"
                required
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 font-medium"
                placeholder="Número exato do cadastro"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Código de Acesso (PIN)</label>
              <input
                type="text"
                required
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                className="block w-full rounded-xl border border-slate-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 font-bold uppercase tracking-wider"
                placeholder="Ex: A7X9B2"
              />
            </div>

            {erro && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2 text-rose-600 text-sm font-medium">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {erro}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={carregando}
                className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all active:scale-[0.98] ${
                  carregando
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {carregando ? 'Acessando...' : 'Acessar Documentos'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={handleVoltar}
              className="text-sm font-medium text-slate-400 hover:text-slate-700 cursor-pointer transition-colors flex items-center justify-center gap-1 w-full"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Voltar para painel do Arquiteto
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- TELA DO DASHBOARD DO CLIENTE (LOGADO) ---
  const listaProjetos = projetosLocais.length > 0 ? projetosLocais : (projetos || []);
  const listaPastas = pastasLocais.length > 0 ? pastasLocais : (pastas || []);
  const listaArquivos = arquivosLocais.length > 0 ? arquivosLocais : (arquivos || []);

  const meusProjetos = listaProjetos.filter(
    (p) => String(typeof p.cliente === 'object' ? p.cliente?.id : p.cliente) === String(clienteLogado.id)
  );

  // Se o cliente abriu um projeto, mostramos os arquivos dele
  if (projetoAberto) {
    const pastasVisiveis = listaPastas.filter(
      (p) =>
        String(typeof p.projeto === 'object' ? p.projeto?.id : p.projeto) === String(projetoAberto.id) &&
        p.visivel_cliente
    );
    const arquivosVisiveis = listaArquivos.filter(
      (a) =>
        String(typeof a.projeto === 'object' ? a.projeto?.id : a.projeto) === String(projetoAberto.id) &&
        a.visivel_cliente &&
        !a.versao_de
    );

    return (
      <div className="min-h-screen w-full bg-slate-50 p-6 sm:p-8 font-sans animate-fadeIn flex flex-col items-center">
        <div className="w-full max-w-5xl">
          <button
            onClick={() => setProjetoAberto(null)}
            className="mb-6 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors shadow-sm cursor-pointer flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5"></path>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Voltar aos Meus Projetos
          </button>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{projetoAberto.nome_projeto}</h2>
              <p className="text-slate-500 text-sm mt-1">{projetoAberto.rua || 'Endereço não informado'}</p>
            </div>
            <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
              <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5">Status da Obra</span>
              <span className="font-bold text-indigo-700">{projetoAberto.fase_atual || 'Em andamento'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-lg font-bold text-slate-900">Documentos & Plantas da Obra</h3>
            <span className="text-xs text-slate-500 font-medium">
              {arquivosVisiveis.length} documento{arquivosVisiveis.length === 1 ? '' : 's'} disponível{arquivosVisiveis.length === 1 ? '' : 'is'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {arquivosVisiveis.map((arq) => {
              const nome = arq.nome || formatarNomeArquivo(arq.arquivo);
              const totalFeedbacks = arq.feedbacks?.length || 0;

              return (
                <div
                  key={arq.id}
                  onClick={() => handleCliqueArquivo(arq)}
                  className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between shadow-xs hover:shadow-md hover:border-indigo-300 transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                          <polyline points="13 2 13 9 20 9"></polyline>
                        </svg>
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-semibold text-slate-900 truncate m-0" title={nome}>
                          {nome}
                        </p>
                        <p className="text-[11px] font-medium text-slate-400 m-0 mt-0.5">
                          Clique para analisar
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <ApprovalStatusBadge status={arq.status_aprovacao} size="sm" />
                      {totalFeedbacks > 0 && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium flex items-center gap-1 border border-slate-200">
                          💬 {totalFeedbacks}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleCliqueArquivo(arq)}
                        className="px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      >
                        Avaliar
                      </button>
                      <a
                        href={getFileUrl(arq.arquivo)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                        title="Baixar Arquivo"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}

            {arquivosVisiveis.length === 0 && pastasVisiveis.length === 0 && (
              <div className="col-span-full py-12 px-6 flex flex-col items-center justify-center text-center bg-white border border-dashed border-slate-300 rounded-3xl">
                <div className="p-4 bg-slate-50 rounded-full mb-3">
                  <svg className="w-8 h-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-900 mb-1">Nenhum documento disponível</p>
                <p className="text-xs text-slate-500">Seu arquiteto ainda não liberou arquivos para visualização nesta obra.</p>
              </div>
            )}
          </div>

          {/* Modal de Análise e Aprovação do Cliente */}
          {arquivoModal && (
            <ClientFileViewerModal
              arquivo={arquivoModal}
              cliente={clienteLogado}
              onClose={() => setArquivoModal(null)}
              onArquivoAtualizado={handleArquivoAtualizado}
              getFileUrl={getFileUrl}
              formatarNomeArquivo={formatarNomeArquivo}
            />
          )}
        </div>
      </div>
    );
  }

  // View inicial do Cliente Logado (Lista de Projetos)
  return (
    <div className="min-h-screen w-full bg-slate-50 p-6 sm:p-8 font-sans animate-fadeIn flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Olá, {clienteLogado.nome.split(' ')[0]}!</h1>
            <p className="text-sm text-slate-500 mt-1">Bem-vindo ao seu portal de acompanhamento de obras.</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer border border-rose-100 shadow-sm flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Sair
          </button>
        </div>

        <h2 className="text-lg font-bold text-slate-900 mb-4 px-1">Suas Obras ({meusProjetos.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meusProjetos.map((projeto) => (
            <div
              key={projeto.id}
              onClick={() => setProjetoAberto(projeto)}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-5">
                <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-xs">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  </svg>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200 uppercase tracking-wide">
                  {projeto.tipo_projeto || 'Projeto'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-indigo-700 transition-colors">{projeto.nome_projeto}</h3>
              <p className="text-sm text-slate-500 mb-5 truncate">{projeto.rua || 'Endereço não cadastrado'}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-sm font-semibold text-indigo-600">Acessar documentos</span>
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          ))}
          {meusProjetos.length === 0 && (
            <div className="col-span-full py-12 px-6 flex flex-col items-center justify-center text-center bg-white border border-dashed border-slate-300 rounded-3xl">
              <div className="p-4 bg-slate-50 rounded-full mb-3">
                <svg className="w-8 h-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-900 mb-1">Nenhuma obra encontrada</p>
              <p className="text-xs text-slate-500">Você não possui projetos ativos vinculados ao seu número.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
