import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ApprovalStatusBadge from '../common/ApprovalStatusBadge';
import api, { aprovarArquivo, rejeitarArquivo, adicionarFeedbackArquivo } from '../../api';
import {
  getFileUrl as helperGetFileUrl,
  formatarNomeArquivo as helperFormatName,
  extrairExtensaoArquivo,
} from '../client-explorer/fileUtils';

export default function ClientFilePage({ onAtualizarDados }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [cliente] = useState(() => {
    try {
      const salvo = localStorage.getItem('cliente_info') || sessionStorage.getItem('cliente_info');
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      return null;
    }
  });

  const [arquivoAtual, setArquivoAtual] = useState(() => {
    return location.state?.arquivo || null;
  });
  const [carregandoArquivo, setCarregandoArquivo] = useState(!location.state?.arquivo);
  const [modoRejeicao, setModoRejeicao] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [novoComentario, setNovoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Busca o arquivo no backend se for carregado diretamente ou para atualizar os dados
  useEffect(() => {
    let ativo = true;

    const buscarArquivo = async () => {
      if (!id) return;
      try {
        setCarregandoArquivo(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const clienteId = localStorage.getItem('cliente_id') || sessionStorage.getItem('cliente_id');
        const headers = {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(clienteId ? { 'X-Cliente-ID': String(clienteId) } : {}),
        };
        const res = await api.get(`arquivos/${id}/`, { headers });
        if (ativo && res?.data) {
          setArquivoAtual(res.data);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do arquivo:', err);
        if (ativo) {
          setErro((prev) => prev || 'Não foi possível carregar os dados deste arquivo.');
        }
      } finally {
        if (ativo) {
          setCarregandoArquivo(false);
        }
      }
    };

    buscarArquivo();

    return () => {
      ativo = false;
    };
  }, [id]);

  // Garante URL absoluta completa com baseURL do backend para prevenir broken images
  const resolverUrlAbsoluta = (caminho) => {
    if (!caminho || typeof caminho !== 'string') return '';
    if (caminho.startsWith('http://') || caminho.startsWith('https://')) {
      return caminho;
    }
    const res = helperGetFileUrl(caminho);
    if (res && (res.startsWith('http://') || res.startsWith('https://'))) {
      return res;
    }
    const backendBase = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
    const cleanPath = caminho.startsWith('/media/')
      ? caminho
      : caminho.startsWith('/')
        ? `/media${caminho}`
        : `/media/${caminho}`;
    return `${backendBase}${cleanPath}`;
  };

  const url = arquivoAtual ? resolverUrlAbsoluta(arquivoAtual.arquivo) : '';
  const nomeExibicao = arquivoAtual?.nome || (arquivoAtual ? helperFormatName(arquivoAtual.arquivo) : '');
  const ext = arquivoAtual ? (extrairExtensaoArquivo(arquivoAtual) || (url.split('?')[0].split('.').pop() || '').toLowerCase()) : '';
  const isImagem = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext);
  const isPdf = ext === 'pdf';
  const feedbacks = Array.isArray(arquivoAtual?.feedbacks) ? arquivoAtual.feedbacks : [];

  const handleAprovar = async () => {
    try {
      setEnviando(true);
      setErro('');
      const atualizado = await aprovarArquivo(arquivoAtual.id);
      setArquivoAtual(atualizado);
      setSucesso('Documento aprovado com sucesso!');
      if (onAtualizarDados) onAtualizarDados();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao aprovar o documento. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const handleRejeitar = async (e) => {
    e.preventDefault();
    if (!motivoRejeicao.trim()) {
      setErro('Por favor, informe a justificativa ou alterações necessárias.');
      return;
    }

    try {
      setEnviando(true);
      setErro('');
      const atualizado = await rejeitarArquivo(arquivoAtual.id, {
        comentario: motivoRejeicao.trim(),
        autor_nome: cliente?.nome || 'Cliente',
      });
      setArquivoAtual(atualizado);
      setModoRejeicao(false);
      setMotivoRejeicao('');
      setSucesso('Alterações solicitadas com sucesso! O status foi atualizado para Rejeitado.');
      if (onAtualizarDados) onAtualizarDados();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao rejeitar o documento. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const handleEnviarComentario = async (e) => {
    e.preventDefault();
    if (!novoComentario.trim()) return;

    try {
      setEnviando(true);
      setErro('');
      const atualizado = await adicionarFeedbackArquivo(arquivoAtual.id, {
        comentario: novoComentario.trim(),
        autor_nome: cliente?.nome || 'Cliente',
      });
      setArquivoAtual(atualizado);
      setNovoComentario('');
      setSucesso('Comentário registrado com sucesso!');
      if (onAtualizarDados) onAtualizarDados();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao enviar comentário.');
    } finally {
      setEnviando(false);
    }
  };

  const handleVoltar = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/portal');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10 font-sans text-slate-800">
      {/* HEADER DA PÁGINA COM BOTÃO VOLTAR PROEMINENTE */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={handleVoltar}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer active:scale-95 shrink-0"
              title="Voltar à lista de pastas e arquivos"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Voltar</span>
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate m-0" title={nomeExibicao}>
                {nomeExibicao || 'Carregando documento...'}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 mt-0.5">
                <span>Formato: .{ext.toUpperCase() || 'ARQUIVO'}</span>
                <span>•</span>
                <span>Visualizador de Projeto do Cliente</span>
              </div>
            </div>
          </div>

          {url && (
            <div className="flex items-center justify-end gap-3 shrink-0 self-end md:self-auto">
              <a
                href={url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                title="Baixar cópia original"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Baixar Arquivo
              </a>
            </div>
          )}
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL DA PÁGINA */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        {carregandoArquivo && !arquivoAtual ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-600">Carregando arquivo...</p>
          </div>
        ) : !arquivoAtual ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            <p className="text-base font-bold text-slate-800 mb-2">Arquivo não encontrado</p>
            <p className="text-sm text-slate-500 mb-6">{erro || 'O arquivo solicitado não existe ou você não tem permissão para acessá-lo.'}</p>
            <button
              onClick={handleVoltar}
              className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-indigo-700 cursor-pointer"
            >
              ← Voltar aos Documentos
            </button>
          </div>
        ) : (
          <>
            {/* CONTAINER DEDICADO DA IMAGEM OU PDF */}
            <div className="relative w-full min-h-[350px] max-h-[75vh] md:max-h-[80vh] bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex items-center justify-center p-4">
              {isImagem ? (
                <img
                  src={url}
                  alt={nomeExibicao}
                  className="w-full h-full max-h-[70vh] object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
                  <div className="w-20 h-20 mb-4 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-xs border border-indigo-100">
                    <svg
                      className="w-10 h-10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1 max-w-sm truncate" title={nomeExibicao}>
                    {nomeExibicao}
                  </h4>
                  <p className="text-xs text-slate-500 mb-5 max-w-xs">
                    {isPdf ? 'Documento PDF pronto para análise.' : 'Documento pronto para análise.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => window.open(url, '_blank')}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Abrir Documento em Nova Guia
                  </button>
                </div>
              )}
            </div>

            {/* STATUS DE VALIDAÇÃO E ALERTAS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Status de Validação
                  </span>
                  <div className="flex items-center gap-3">
                    <ApprovalStatusBadge status={arquivoAtual.status_aprovacao} size="lg" />
                    <span className="text-xs text-slate-500 font-medium">
                      {feedbacks.length} feedback{feedbacks.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              </div>

              {sucesso && (
                <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold animate-fadeIn flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  {sucesso}
                </div>
              )}

              {erro && (
                <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold animate-fadeIn flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {erro}
                </div>
              )}
            </div>

            {/* SEÇÃO DE AÇÃO DO CLIENTE (APROVAR / REJEITAR) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              {arquivoAtual.status_aprovacao === 'PENDENTE' ? (
                !modoRejeicao ? (
                  <div>
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">
                      Ação Necessária: Revisão do Documento
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <button
                        type="button"
                        onClick={handleAprovar}
                        disabled={enviando}
                        className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {enviando ? 'Processando...' : 'Aprovar Planta'}
                      </button>

                      <button
                        type="button"
                        onClick={() => { setModoRejeicao(true); setErro(''); }}
                        disabled={enviando}
                        className="flex-1 py-3 px-4 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        Rejeitar / Solicitar Alteração
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleRejeitar} className="w-full space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-rose-700">
                        Motivo das Alterações (Obrigatório)
                      </label>
                      <button
                        type="button"
                        onClick={() => setModoRejeicao(false)}
                        className="text-[11px] text-slate-400 hover:text-slate-700 font-semibold cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                    <textarea
                      required
                      autoFocus
                      rows={3}
                      value={motivoRejeicao}
                      onChange={(e) => setMotivoRejeicao(e.target.value)}
                      placeholder="Ex: Gostaria de alterar a porta da suíte para o lado direito e aumentar o vão da janela..."
                      className="w-full p-3 text-xs bg-rose-50/30 border border-rose-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-900 placeholder:text-slate-400 resize-none font-medium"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setModoRejeicao(false)}
                        className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        disabled={enviando}
                        className="flex-2 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
                      >
                        {enviando ? 'Enviando...' : 'Confirmar Rejeição'}
                      </button>
                    </div>
                  </form>
                )
              ) : (
                <div className="w-full flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {arquivoAtual.status_aprovacao === 'APROVADO' ? (
                      <span className="text-xs sm:text-sm font-bold text-emerald-700 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">✓</span>
                        Planta Aprovada por você!
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm font-bold text-rose-700 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center">✕</span>
                        Revisão Rejeitada. Aguarde o envio de nova versão.
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleVoltar}
                    className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Voltar aos Documentos
                  </button>
                </div>
              )}
            </div>

            {/* HISTÓRICO DE FEEDBACKS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                Histórico de Feedbacks ({feedbacks.length})
              </span>

              {feedbacks.length === 0 ? (
                <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl p-4">
                  <svg className="w-8 h-8 mx-auto mb-2 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <p className="text-xs font-medium text-slate-600 mb-0.5">Sem comentários registrados</p>
                  <p className="text-[11px] text-slate-400">Esta versão do arquivo ainda não possui observações.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {feedbacks.map((f, idx) => {
                    const isClient = f.autor_nome === cliente?.nome || f.autor_nome?.toLowerCase() === 'cliente';
                    return (
                      <div
                        key={f.id || idx}
                        className={`p-4 rounded-xl border transition-all ${
                          isClient
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-indigo-50/60 border-indigo-100 text-indigo-950'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isClient ? 'bg-slate-200 text-slate-700' : 'bg-indigo-600 text-white'
                            }`}>
                              {f.autor_nome?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-xs font-bold text-slate-800">
                              {f.autor_nome} {isClient && '(Você)'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {f.criado_em ? new Date(f.criado_em).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap m-0">
                          {f.comentario}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* FORMULÁRIO DE COMENTÁRIO ADICIONAL (Quando já Aprovado ou Rejeitado) */}
            {(arquivoAtual.status_aprovacao === 'APROVADO' || arquivoAtual.status_aprovacao === 'REJEITADO') && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <form onSubmit={handleEnviarComentario} className="space-y-3">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                    Adicionar Novo Comentário
                  </label>
                  <textarea
                    rows={3}
                    value={novoComentario}
                    onChange={(e) => setNovoComentario(e.target.value)}
                    placeholder="Deixe uma observação adicional para o arquiteto..."
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 resize-none font-medium"
                  />
                  <button
                    type="submit"
                    disabled={enviando || !novoComentario.trim()}
                    className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {enviando ? 'Enviando...' : 'Enviar Comentário'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
