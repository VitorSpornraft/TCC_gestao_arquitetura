export default function ClientLoginView({
  telefone,
  setTelefone,
  codigo,
  setCodigo,
  erro,
  carregando,
  onSubmit,
  onVoltar,
}) {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-center items-center p-6 pb-32 font-sans animate-fadeIn">
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
        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Telefone</label>
            <input
              type="text"
              required
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 font-medium"
              placeholder="Número do telefone com DDD"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Código de Acesso (PIN)</label>
            <input
              type="text"
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              className="block w-full rounded-xl border border-slate-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 font-bold uppercase tracking-wider text-center text-lg"
              placeholder="Ex: CLI1020"
            />
          </div>

          {erro && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2 text-rose-600 text-sm font-medium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{erro}</span>
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

        {onVoltar && (
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={onVoltar}
              className="text-sm font-medium text-slate-400 hover:text-slate-700 cursor-pointer transition-colors flex items-center justify-center gap-1 w-full"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Voltar para painel do Arquiteto</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

