export default function ProjectOverviewCard({
  projetoSelecionado,
  clienteObj,
  telefoneFormatado,
  enderecoFormatado,
  dataCriacaoFormatada,
  mostrarPin,
  setMostrarPin,
}) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-8 mb-8 shadow-xs">
      <div className="border-b border-slate-100 pb-5 mb-6">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3 mt-0">
          {projetoSelecionado.nome_projeto || "Projeto sem título"}
        </h2>
        {clienteObj && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Badge 1: Cliente e Telefone */}
            <div className="inline-flex items-center gap-2 bg-indigo-50/70 border border-indigo-100 px-3.5 py-1.5 rounded-xl text-sm font-medium text-indigo-900 shadow-xs">
              <svg
                className="w-4 h-4 text-indigo-500 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>
                <span className="font-semibold text-indigo-950">
                  {clienteObj.nome}
                </span>
                <span className="text-indigo-400 mx-1.5">—</span>
                <span className="text-indigo-700">{telefoneFormatado}</span>
              </span>
            </div>

            {/* Badge 2: PIN de Acesso com Olho (Senha) */}
            <div className="inline-flex items-center gap-2.5 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl text-sm font-medium text-slate-700 shadow-sm">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                PIN:
              </span>
              <span className="font-mono font-bold text-slate-900 tracking-widest min-w-[60px] text-center">
                {mostrarPin ? clienteObj.codigo_acesso || "S/ PIN" : "••••••"}
              </span>
              <button
                onClick={() => setMostrarPin(!mostrarPin)}
                className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer p-0.5 outline-none"
                title={mostrarPin ? "Ocultar PIN" : "Mostrar PIN"}
              >
                {mostrarPin ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Endereço da Obra
          </span>
          <span className="text-sm font-medium text-slate-900">
            {enderecoFormatado}
          </span>
        </div>
        <div>
          <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Fase Atual
          </span>
          <span className="inline-block px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded-md text-xs font-semibold text-indigo-700">
            {projetoSelecionado.fase_atual || "Não definida"}
          </span>
        </div>
        <div>
          <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Tipo
          </span>
          <span className="text-sm font-medium text-slate-900">
            {projetoSelecionado.tipo_projeto || "Não definido"}
          </span>
        </div>
        <div>
          <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Cadastrado em
          </span>
          <span className="text-sm font-medium text-slate-900">
            {dataCriacaoFormatada}
          </span>
        </div>
      </div>
    </div>
  );
}
