import { useState, useEffect } from 'react';
import ApprovalStatusBadge from '../common/ApprovalStatusBadge';
import { aprovarArquivo, rejeitarArquivo, adicionarFeedbackArquivo } from '../../api';
import { getFileUrl as helperGetFileUrl, formatarNomeArquivo as helperFormatName, extrairExtensaoArquivo } from '../client-explorer/fileUtils';

export default function ClientFileViewerModal({
  arquivo,
  cliente,
  onClose,
  onArquivoAtualizado,
  getFileUrl,
  formatarNomeArquivo,
}) {
  const [arquivoAtual, setArquivoAtual] = useState(arquivo);
  const [modoRejeicao, setModoRejeicao] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [novoComentario, setNovoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    setArquivoAtual(arquivo);
    setModoRejeicao(false);
    setMotivoRejeicao('');
    setNovoComentario('');
    setErro('');
    setSucesso('');
  }, [arquivo]);

  if (!arquivoAtual) return null;

  // Garante URL absoluta completa com baseURL do backend para prevenir broken images
  const resolverUrlAbsoluta = (caminho) => {
    if (!caminho || typeof caminho !== 'string') return '';
    if (caminho.startsWith('http://') || caminho.startsWith('https://')) {
      return caminho;
    }
    const fn = typeof getFileUrl === 'function' ? getFileUrl : helperGetFileUrl;
    const res = fn(caminho);
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

  const url = resolverUrlAbsoluta(arquivoAtual.arquivo);
  const nomeExibicao = arquivoAtual.nome || (formatarNomeArquivo ? formatarNomeArquivo(arquivoAtual.arquivo) : helperFormatName(arquivoAtual.arquivo));
  const ext = extrairExtensaoArquivo(arquivoAtual) || (url.split('?')[0].split('.').pop() || '').toLowerCase();
  const isImagem = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext);
  const isPdf = ext === 'pdf';

  const feedbacks = Array.isArray(arquivoAtual.feedbacks) ? arquivoAtual.feedbacks : [];

  const handleAprovar = async () => {
    try {
      setEnviando(true);
      setErro('');
      const atualizado = await aprovarArquivo(arquivoAtual.id);
      setArquivoAtual(atualizado);
      setSucesso('Documento aprovado com sucesso!');
      if (onArquivoAtualizado) onArquivoAtualizado(atualizado);
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
      if (onArquivoAtualizado) onArquivoAtualizado(atualizado);
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
      if (onArquivoAtualizado) onArquivoAtualizado(atualizado);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao enviar comentário.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-xs p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-h-[95vh] md:max-h-[90vh] w-full max-w-4xl flex flex-col shadow-2xl overflow-hidden animate-slideUp">
        
        {/* CABEÇALHO DO VISUALIZADOR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:px-6 md:py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-slate-900 truncate m-0" title={nomeExibicao}>
                {nomeExibicao}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mt-0.5">
                <span>Formato: .{ext.toUpperCase() || 'ARQUIVO'}</span>
                <span>•</span>
                <span>Visualizador de Projeto do Cliente</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 shrink-0">
            <a
              href={url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
              title="Baixar cópia original"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Baixar
            </a>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-xl text-lg font-bold transition-colors cursor-pointer"
              title="Fechar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ÁREA DE CONTEÚDO INTERNO (SCROLLÁVEL) */}
        <div className="overflow-y-auto flex-1 p-4 md:p-6 bg-slate-50/30 space-y-5">
          
          {/* CONTAINER DEDICADO DA IMAGEM / ARQUIVO */}
          <div className="relative w-full h-[35vh] md:h-[50vh] bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center mb-4">
            {isImagem ? (
              <img
                src={url}
                alt={nomeExibicao}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 max-w-md mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mb-3 bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-xs border border-slate-200 dark:border-slate-600">
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10"
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
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mb-1 max-w-xs truncate" title={nomeExibicao}>
                  {nomeExibicao}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs">
                  {isPdf ? 'Documento PDF pronto para análise.' : 'Documento pronto para análise.'}
                </p>
                <button
                  type="button"
                  onClick={() => window.open(url, '_blank')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
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
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold animate-fadeIn flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                {sucesso}
              </div>
            )}

            {erro && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold animate-fadeIn flex items-center gap-2">
                <svg className="w-4 h-4 text-rose-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {erro}
              </div>
            )}
          </div>

          {/* HISTÓRICO DE FEEDBACKS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
              Histórico de Feedbacks
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
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {feedbacks.map((f, idx) => {
                  const isClient = f.autor_nome === cliente?.nome || f.autor_nome?.toLowerCase() === 'cliente';
                  return (
                    <div
                      key={f.id || idx}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isClient
                          ? 'bg-slate-50/70 border-slate-200 shadow-2xs'
                          : 'bg-indigo-50/60 border-indigo-100 text-indigo-950 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
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

          {/* ÁREA DE AÇÃO CONDICIONAL */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
            
            {/* CASO 1: STATUS PENDENTE */}
            {arquivoAtual.status_aprovacao === 'PENDENTE' && (
              <div>
                {!modoRejeicao ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 mb-3 leading-snug">
                      Esta versão está em análise. Como cliente, você pode aprovar ou solicitar revisões à equipe.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={handleAprovar}
                        disabled={enviando}
                        className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
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
                        className="flex-1 py-3 px-4 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 border border-rose-200 hover:border-rose-300 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
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
                  <form onSubmit={handleRejeitar} className="space-y-3 animate-fadeIn">
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
                        className="flex-2 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {enviando ? 'Enviando...' : 'Confirmar Rejeição'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* CASO 2: STATUS APROVADO OU REJEITADO */}
            {(arquivoAtual.status_aprovacao === 'APROVADO' || arquivoAtual.status_aprovacao === 'REJEITADO') && (
              <div className="space-y-3">
                <div className={`p-3 rounded-xl border text-xs font-medium ${
                  arquivoAtual.status_aprovacao === 'APROVADO'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {arquivoAtual.status_aprovacao === 'APROVADO' ? (
                    <p className="m-0 flex items-center gap-1.5 font-bold">
                      <span>✓</span> Planta Aprovada por você!
                    </p>
                  ) : (
                    <p className="m-0 flex items-center gap-1.5 font-bold">
                      <span>✕</span> Revisão Rejeitada. Aguarde o envio de uma nova versão.
                    </p>
                  )}
                </div>

                <form onSubmit={handleEnviarComentario} className="space-y-2.5 pt-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                    Adicionar Novo Comentário
                  </label>
                  <textarea
                    rows={2}
                    value={novoComentario}
                    onChange={(e) => setNovoComentario(e.target.value)}
                    placeholder="Deixe uma observação adicional para o arquiteto..."
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 resize-none font-medium"
                  />
                  <button
                    type="submit"
                    disabled={enviando || !novoComentario.trim()}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {enviando ? 'Enviando...' : 'Enviar Comentário'}
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
