import { useState, useEffect } from 'react';
import ApprovalStatusBadge from '../common/ApprovalStatusBadge';
import { adicionarFeedbackArquivo } from '../../api';
import { getFileUrl as helperGetFileUrl, formatarNomeArquivo as helperFormatName, extrairExtensaoArquivo } from './fileUtils';

export default function ImagePreviewModal({
  arquivo,
  getFileUrl,
  formatarNomeArquivo,
  onDownload,
  onClose,
  aoAtualizarDados,
}) {
  const [arquivoAtual, setArquivoAtual] = useState(arquivo);
  const [novoComentario, setNovoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    setArquivoAtual(arquivo);
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
  const nomeArquivo = arquivoAtual.nome || (formatarNomeArquivo ? formatarNomeArquivo(arquivoAtual.arquivo) : helperFormatName(arquivoAtual.arquivo));
  const ext = extrairExtensaoArquivo(arquivoAtual) || (url.split('?')[0].split('.').pop() || '').toLowerCase();
  const isImagem = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext);
  const isPdf = ext === 'pdf';
  const feedbacks = Array.isArray(arquivoAtual.feedbacks) ? arquivoAtual.feedbacks : [];

  const handleEnviarFeedbackArquiteto = async (e) => {
    e.preventDefault();
    if (!novoComentario.trim()) return;

    try {
      setEnviando(true);
      setErro('');
      const atualizado = await adicionarFeedbackArquivo(arquivoAtual.id, {
        comentario: novoComentario.trim(),
        autor_nome: 'Arquiteto',
      });
      setArquivoAtual(atualizado);
      setNovoComentario('');
      setSucesso('Comentário registrado com sucesso!');
      if (aoAtualizarDados) aoAtualizarDados();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao registrar comentário.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-xs p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp">
        
        {/* CABEÇALHO DO MODAL */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="overflow-hidden pr-4 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="overflow-hidden">
              <h3 className="text-sm font-bold text-slate-900 truncate m-0" title={nomeArquivo}>
                {nomeArquivo}
              </h3>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                Visualização do Arquiteto • Feedbacks do Cliente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onDownload(url, nomeArquivo)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Baixar Arquivo
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-900 text-lg transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-slate-100"
            >
              ✕
            </button>
          </div>
        </div>

        {/* CORPO: PREVIEW + TIMELINE DE FEEDBACKS */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100/50">
          
          {/* LADO ESQUERDO: ÁREA DE PREVIEW */}
          <div className="flex-1 bg-slate-900/5 flex items-center justify-center p-4 sm:p-6 overflow-auto">
            {isImagem ? (
              <img
                src={url}
                alt={nomeArquivo}
                className="w-auto max-w-full max-h-[85vh] object-contain mx-auto rounded-xl shadow-md bg-white border border-slate-200"
              />
            ) : isPdf ? (
              <div className="w-full h-full bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                <iframe
                  src={url}
                  title="Pré-visualização de Documento"
                  className="w-full h-full border-none"
                />
              </div>
            ) : (
              <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-sm">
                <div className="w-12 h-12 mx-auto mb-3 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">{nomeArquivo}</h4>
                <p className="text-xs text-slate-500 mb-4">Pré-visualização direta não disponível para este formato.</p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold inline-block"
                >
                  Abrir Arquivo Externamente
                </a>
              </div>
            )}
          </div>

          {/* LADO DIREITO: SIDEBAR DE FEEDBACKS DO CLIENTE */}
          <div className="w-full lg:w-96 lg:max-w-md bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-full shadow-md">
            
            {/* CABEÇALHO DA SIDEBAR */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Status de Validação do Cliente
              </span>
              <div className="flex items-center justify-between gap-3">
                <ApprovalStatusBadge status={arquivoAtual.status_aprovacao} size="md" />
                <span className="text-xs text-slate-500 font-medium">
                  {feedbacks.length} registro{feedbacks.length === 1 ? '' : 's'}
                </span>
              </div>

              {sucesso && (
                <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold animate-fadeIn flex items-center gap-1.5">
                  <span>✓</span> {sucesso}
                </div>
              )}

              {erro && (
                <div className="mt-3 p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold animate-fadeIn flex items-center gap-1.5">
                  <span>⚠️</span> {erro}
                </div>
              )}
            </div>

            {/* TIMELINE DE FEEDBACKS */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Linha do Tempo
                </span>
              </div>

              {feedbacks.length === 0 ? (
                <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl p-4">
                  <svg className="w-8 h-8 mx-auto mb-2 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <p className="text-xs font-semibold text-slate-600 mb-0.5">Nenhum feedback do cliente</p>
                  <p className="text-[11px] text-slate-400">O cliente ainda não enviou aprovações ou observações para esta versão.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {feedbacks.map((f, idx) => {
                    const isArquiteto = f.autor_nome?.toLowerCase() === 'arquiteto';
                    return (
                      <div
                        key={f.id || idx}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isArquiteto
                            ? 'bg-indigo-50/60 border-indigo-100 text-indigo-950'
                            : 'bg-white border-slate-200/90 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isArquiteto ? 'bg-indigo-600 text-white' : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {f.autor_nome?.charAt(0)?.toUpperCase() || 'C'}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {f.autor_nome} {isArquiteto && '(Você)'}
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

            {/* ADICIONAR FEEDBACK OU RESPOSTA PELO ARQUITETO */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <form onSubmit={handleEnviarFeedbackArquiteto} className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Responder ou Registrar Nota
                </label>
                <textarea
                  rows={2}
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  placeholder="Escreva uma observação técnica ou resposta ao cliente..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 resize-none font-medium"
                />
                <button
                  type="submit"
                  disabled={enviando || !novoComentario.trim()}
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {enviando ? 'Enviando...' : 'Adicionar Nota / Resposta'}
                </button>
              </form>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
