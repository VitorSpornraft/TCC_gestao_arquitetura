export default function ConfirmCommitModal({ fluxoVersao, setFluxoVersao, arquivoSelecionado, formatarNomeArquivo, cancelarUpload, fazerUploadECommit }) {
  if (fluxoVersao.passo !== 3 || !fluxoVersao.arquivoPai) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slideUp">
        <div className="bg-indigo-600 p-6 text-white text-center relative">
          <button onClick={() => setFluxoVersao({ ...fluxoVersao, passo: 2, arquivoPai: null })} className="absolute top-4 left-4 text-white/70 hover:text-white cursor-pointer flex items-center gap-1 text-sm font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Voltar
          </button>
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 font-bold text-lg mb-3">3</span>
          <h3 className="text-xl font-bold m-0">Confirmar Nova Versão</h3>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Atualizando Arquivo:</p>
            <p className="text-sm font-bold text-slate-800 truncate mb-3">{fluxoVersao.arquivoPai.nome || formatarNomeArquivo(fluxoVersao.arquivoPai.arquivo)}</p>
            
            <div className="flex justify-center mb-3 text-indigo-500"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg></div>
            
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Com o novo upload:</p>
            <p className="text-sm font-bold text-indigo-700 truncate bg-indigo-50 py-1 rounded">{arquivoSelecionado.name}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Comentário / O que mudou? (Opcional)</label>
            <textarea className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-all" rows="2" placeholder="Ex: Ajuste na paginação do piso..."
              value={fluxoVersao.comentario} onChange={e => setFluxoVersao({ ...fluxoVersao, comentario: e.target.value })}></textarea>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button onClick={cancelarUpload} className="px-4 py-2 text-slate-500 hover:text-slate-800 font-medium text-sm cursor-pointer transition-colors">Cancelar</button>
            <button onClick={() => fazerUploadECommit(true)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg cursor-pointer transition-transform flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Confirmar e Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}