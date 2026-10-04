import { useState, useEffect } from 'react';
import ApprovalStatusBadge from '../common/ApprovalStatusBadge';

export default function HistoricoModal({
  arquivoId,
  arquivoNome,
  onClose,
  listaArquivos = [],
}) {
  const [versoes, setVersoes] = useState([]);

  useEffect(() => {
    if (!arquivoId) return;

    // 1. Encontra o arquivo selecionado na lista geral
    const arquivoAtual = listaArquivos.find(a => String(a.id) === String(arquivoId));
    if (!arquivoAtual) {
      setVersoes([]);
      return;
    }

    // 2. Descobre quem é a Raiz (se for versão de alguém, pega o pai. Senão, ele mesmo é a raiz)
    const idRaiz = arquivoAtual.versao_de ? (typeof arquivoAtual.versao_de === 'object' ? arquivoAtual.versao_de.id : arquivoAtual.versao_de) : arquivoAtual.id;

    // 3. Pega a própria Raiz + todas as versões filhas que apontam para essa Raiz
    const arquivoRaizObj = listaArquivos.find(a => String(a.id) === String(idRaiz));
    const filhas = listaArquivos.filter(a => {
      const paiId = a.versao_de ? (typeof a.versao_de === 'object' ? a.versao_de.id : a.versao_de) : null;
      return String(paiId) === String(idRaiz);
    });

    // 4. Junta tudo e ordena da mais recente para a mais antiga
    const todasAsVersoes = [];
    if (arquivoRaizObj) todasAsVersoes.push(arquivoRaizObj);
    todasAsVersoes.push(...filhas);

    // Remove duplicadas e ordena por data de criação (descendente)
    const unicas = Array.from(new Set(todasAsVersoes.map(a => a.id)))
      .map(id => todasAsVersoes.find(a => a.id === id))
      .sort((a, b) => new Date(b.criado_em || 0) - new Date(a.criado_em || 0));

    setVersoes(unicas);
  }, [arquivoId, listaArquivos]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-5 animate-slideUp">
        
        {/* TOPO */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </span>
              <h3 className="text-base font-semibold text-zinc-900 m-0">Histórico de Versões</h3>
            </div>
            <p className="text-xs text-zinc-500 m-0 mt-1 truncate max-w-[320px]">{arquivoNome}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 text-lg p-1 cursor-pointer">✕</button>
        </div>

        {/* LISTAGEM DAS VERSÕES */}
        {versoes.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6">Nenhum histórico encontrado para este documento.</p>
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {versoes.map((ver, index) => {
              const isAtual = index === 0;
              const numeroVersao = versoes.length - index;
              const nomeVer = ver.arquivo ? ver.arquivo.split('/').pop() : 'Documento';
              const dataFormatada = ver.criado_em ? new Date(ver.criado_em).toLocaleString('pt-BR') : 'Data não registrada';
              const urlArquivo = ver.arquivo?.startsWith('http') ? ver.arquivo : `http://127.0.0.1:8000${ver.arquivo}`;

              return (
                <div 
                  key={ver.id || index} 
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    isAtual 
                      ? 'bg-indigo-50/40 border-indigo-200 ring-1 ring-indigo-500/20' 
                      : 'bg-zinc-50/70 border-zinc-200/80'
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isAtual ? 'bg-indigo-600 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
                        Versão {numeroVersao} {isAtual && '(Atual)'}
                      </span>
                      <ApprovalStatusBadge status={ver.status_aprovacao} size="xs" />
                      <span className="text-[11px] text-zinc-400">{dataFormatada}</span>
                    </div>
                    <span className="text-sm font-semibold text-zinc-800 truncate" title={nomeVer}>{nomeVer}</span>
                    {ver.comentario && (
                      <span className="text-xs text-zinc-500 mt-1 italic">"{ver.comentario}"</span>
                    )}
                    {ver.feedbacks && ver.feedbacks.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-200/80 space-y-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block">
                          Feedbacks ({ver.feedbacks.length}):
                        </span>
                        {ver.feedbacks.map((f, fIdx) => (
                          <div key={f.id || fIdx} className="bg-white p-2 rounded-lg border border-zinc-200 text-xs">
                            <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-0.5">
                              <span className="font-bold text-zinc-700">{f.autor_nome}</span>
                              <span>{f.criado_em ? new Date(f.criado_em).toLocaleDateString('pt-BR') : ''}</span>
                            </div>
                            <p className="text-zinc-600 m-0">{f.comentario}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <a 
                    href={urlArquivo} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shrink-0 cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Baixar
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {/* RODAPÉ */}
        <div className="flex justify-end pt-2 border-t border-zinc-100">
          <button onClick={onClose} className="px-5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium rounded-xl cursor-pointer transition-colors">
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}