export default function LinkTaskModal({ fluxoVersao, setFluxoVersao, tarefasDaObra, tarefaSelecionadaObj, cancelarUpload }) {
  if (fluxoVersao.passo !== 1) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slideUp">
        <div className="bg-indigo-600 p-6 text-white text-center">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 font-bold text-lg mb-3">1</span>
          <h3 className="text-xl font-bold m-0">Vincular ao Kanban</h3>
          <p className="text-sm text-indigo-100 mt-1">Este arquivo atende a alguma tarefa do projeto? (Opcional)</p>
        </div>
        
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Selecione a Tarefa</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all cursor-pointer" 
              value={fluxoVersao.tarefaId} onChange={e => setFluxoVersao({ ...fluxoVersao, tarefaId: e.target.value, subtarefaId: '' })}>
              <option value="">Não vincular a nenhuma tarefa</option>
              {tarefasDaObra.map(t => <option key={t.id} value={t.id}>{t.titulo} ({t.categoria})</option>)}
            </select>
          </div>

          {tarefaSelecionadaObj && tarefaSelecionadaObj.subtarefas?.length > 0 && (
            <div className="animate-fadeIn bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <label className="block text-sm font-semibold text-indigo-900 mb-2">Vincular a um Item do Checklist</label>
              <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none mb-3 cursor-pointer" 
                value={fluxoVersao.subtarefaId} onChange={e => setFluxoVersao({ ...fluxoVersao, subtarefaId: e.target.value })}>
                <option value="">Apenas à tarefa principal</option>
                {tarefaSelecionadaObj.subtarefas.map(sub => <option key={sub.id} value={sub.id}>{sub.titulo} {sub.concluida ? ' (Já concluído)' : ''}</option>)}
              </select>

              {fluxoVersao.subtarefaId && (
                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input type="checkbox" className="w-4 h-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                    checked={fluxoVersao.marcarChecklist} onChange={e => setFluxoVersao({ ...fluxoVersao, marcarChecklist: e.target.checked })} />
                  <span className="text-sm font-medium text-indigo-900">Marcar este item como "Concluído" no Kanban</span>
                </label>
              )}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button onClick={cancelarUpload} className="px-4 py-2 text-slate-500 hover:text-slate-800 font-medium text-sm cursor-pointer transition-colors">Cancelar</button>
            <button onClick={() => setFluxoVersao({ ...fluxoVersao, passo: 2 })} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-transform flex items-center gap-2">
              Avançar 
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}