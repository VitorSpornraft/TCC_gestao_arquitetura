import ApprovalStatusBadge from "../common/ApprovalStatusBadge";

export default function VersionHistoryModal({ gerenciarVersoesDe, setGerenciarVersoesDe, listaArquivos, formatarNomeArquivo, getFileUrl, forcarDownload }) {
  if (!gerenciarVersoesDe) return null;

  const idRaizAlvo = String(
    gerenciarVersoesDe.arquivo_raiz_id ||
    gerenciarVersoesDe.arquivo_raiz?.id ||
    (typeof gerenciarVersoesDe.versao_de === 'object' && gerenciarVersoesDe.versao_de !== null
      ? gerenciarVersoesDe.versao_de.id
      : gerenciarVersoesDe.versao_de) ||
    gerenciarVersoesDe.id
  );

  const todasVersoes = (
    Array.isArray(gerenciarVersoesDe.todas_versoes) && gerenciarVersoesDe.todas_versoes.length > 0
      ? gerenciarVersoesDe.todas_versoes
      : (listaArquivos || []).filter((a) => {
          const versaoDeId =
            typeof a.versao_de === 'object' && a.versao_de !== null
              ? a.versao_de.id
              : a.versao_de;
          return String(a.id) === idRaizAlvo || String(versaoDeId) === idRaizAlvo;
        })
  )
    .slice()
    .sort((a, b) => {
      const dataA = a.criado_em ? new Date(a.criado_em).getTime() : 0;
      const dataB = b.criado_em ? new Date(b.criado_em).getTime() : 0;
      if (dataB !== dataA) return dataB - dataA;
      return Number(b.id || 0) - Number(a.id || 0);
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-slideUp flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div className="overflow-hidden">
              <h3 className="text-lg font-bold text-slate-900 m-0">Histórico de Versões</h3>
              <p className="text-sm text-slate-500 m-0 truncate max-w-md">{gerenciarVersoesDe.nome || formatarNomeArquivo(gerenciarVersoesDe.arquivo)}</p>
            </div>
          </div>
          <button onClick={() => setGerenciarVersoesDe(null)} className="text-slate-400 hover:text-slate-900 text-xl cursor-pointer p-2">✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {todasVersoes.map((v, idx) => {
            const numVersao = todasVersoes.length - idx;
            const isAtual = idx === 0;

            return (
              <div key={v.id} className={`p-4 rounded-xl border ${isAtual ? 'bg-white border-indigo-400 shadow-md ring-1 ring-indigo-400' : 'bg-white border-slate-200 opacity-90 hover:opacity-100'} flex items-start justify-between gap-4 transition-all`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${isAtual ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                      Versão {numVersao} {isAtual && '(Atual)'}
                    </span>
                    <ApprovalStatusBadge status={v.status_aprovacao} size="sm" />
                    <span className="text-xs text-slate-400 font-medium">{new Date(v.criado_em).toLocaleString('pt-BR')}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 truncate m-0">{formatarNomeArquivo(v.arquivo)}</p>
                  {v.comentario && <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg italic border border-slate-100">"{v.comentario}"</p>}
                  {v.tarefa && <p className="text-xs text-indigo-600 mt-2 font-medium flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Vinculado ao Kanban</p>}

                  {v.feedbacks && v.feedbacks.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                        Feedbacks do Cliente ({v.feedbacks.length}):
                      </span>
                      {v.feedbacks.map((f, fIdx) => (
                        <div key={f.id || fIdx} className="bg-slate-50 p-2 rounded-lg border border-slate-200/80 text-xs">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-0.5 font-medium">
                            <span className="font-bold text-slate-700">{f.autor_nome}</span>
                            <span>{f.criado_em ? new Date(f.criado_em).toLocaleDateString('pt-BR') : ''}</span>
                          </div>
                          <p className="text-slate-600 m-0">{f.comentario}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => forcarDownload(getFileUrl(v.arquivo), formatarNomeArquivo(v.arquivo))} className={`shrink-0 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors ${isAtual ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Baixar
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}