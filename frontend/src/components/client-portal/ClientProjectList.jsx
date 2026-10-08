export default function ClientProjectList({
  clienteLogado,
  projetos = [],
  carregandoObras = false,
  onSelecionarProjeto,
  onAcessoProjeto,
  onLogout,
}) {
  const handleAbrir = onSelecionarProjeto || onAcessoProjeto;
  const primeiroNome = clienteLogado?.nome ? clienteLogado.nome.split(' ')[0] : 'Cliente';

  return (
    <div className="min-h-screen w-full bg-slate-50 p-6 sm:p-8 pb-32 font-sans animate-fadeIn flex flex-col items-center">
      <div className="w-full max-w-5xl">
        {/* CABEÇALHO DE BOAS-VINDAS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Olá, {primeiroNome}!
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Bem-vindo ao seu portal de acompanhamento de obras.
            </p>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2.5 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer border border-rose-100 shadow-sm flex items-center gap-2 self-start sm:self-auto active:scale-95"
              title="Encerrar sessão"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Sair</span>
            </button>
          )}
        </div>

        {/* LISTAGEM DE OBRAS */}
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-lg font-bold text-slate-900">
            Suas Obras ({projetos.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projetos.map((projeto) => (
            <div
              key={projeto.id}
              onClick={() => handleAbrir && handleAbrir(projeto)}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
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
                <h3 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-indigo-700 transition-colors">
                  {projeto.nome_projeto}
                </h3>
                <p className="text-sm text-slate-500 mb-5 truncate">
                  {projeto.rua || 'Endereço não cadastrado'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-sm font-semibold text-indigo-600 group-hover:underline">
                  Acessar documentos
                </span>
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          ))}

          {/* ESTADO DE CARREGAMENTO */}
          {carregandoObras && projetos.length === 0 && (
            <div className="col-span-full py-12 px-6 flex flex-col items-center justify-center text-center bg-white border border-slate-200 rounded-3xl shadow-xs">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-semibold text-slate-800 mb-1">Carregando suas obras...</p>
              <p className="text-xs text-slate-400">Buscando os projetos atualizados do seu painel.</p>
            </div>
          )}

          {/* ESTADO VAZIO */}
          {!carregandoObras && projetos.length === 0 && (
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

