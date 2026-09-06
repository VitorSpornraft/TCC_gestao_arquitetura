import { useState } from 'react';

export default function Navbar({ telaAtual, setTelaAtual, setClienteSelecionado }) {
  const [recolhido, setRecolhido] = useState(false);

  return (
    <aside className={`bg-white border-r border-zinc-200/80 transition-all duration-300 ease-in-out flex flex-col justify-between p-4 shrink-0 shadow-xs ${recolhido ? 'w-20' : 'w-64'}`}>
      <div>
        {/* TOPO: LOGO E BOTÃO DE RECOLHER */}
        <div className={`flex items-center justify-between mb-8 ${recolhido ? 'flex-col gap-4' : ''}`}>
          {!recolhido && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-zinc-900 tracking-tight m-0 truncate">Gestão Arquitetônica</h1>
              <span className="text-[11px] text-indigo-600 font-semibold tracking-wide uppercase">Painel TCC FEMA</span>
            </div>
          )}
          <button
            onClick={() => setRecolhido(!recolhido)}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            title={recolhido ? 'Expandir Menu' : 'Recolher Menu'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {recolhido ? (
                <polyline points="9 18 15 12 9 6"></polyline>
              ) : (
                <polyline points="15 18 9 12 15 6"></polyline>
              )}
            </svg>
          </button>
        </div>

        {/* OPÇÕES DE NAVEGAÇÃO */}
        <nav className="space-y-1.5">
          {/* Quadro Kanban */}
          <button
            onClick={() => setTelaAtual('kanban')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              telaAtual === 'kanban'
                ? 'bg-indigo-50 text-indigo-600 shadow-2xs font-semibold'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
            title="Quadro Kanban"
          >
            <svg 
              className={`w-5 h-5 shrink-0 transition-colors ${telaAtual === 'kanban' ? 'text-indigo-600' : 'text-zinc-400 group-hover:text-zinc-900'}`} 
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="9" rx="1"></rect>
              <rect x="14" y="3" width="7" height="5" rx="1"></rect>
              <rect x="14" y="12" width="7" height="9" rx="1"></rect>
              <rect x="3" y="16" width="7" height="5" rx="1"></rect>
            </svg>
            {!recolhido && <span className="truncate">Quadro Kanban</span>}
          </button>

          {/* Clientes & Arquivos */}
          <button
            onClick={() => { setTelaAtual('clientes'); setClienteSelecionado(null); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              telaAtual === 'clientes' || telaAtual === 'explorador'
                ? 'bg-indigo-50 text-indigo-600 shadow-2xs font-semibold'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
            title="Clientes & Arquivos"
          >
            <svg 
              className={`w-5 h-5 shrink-0 transition-colors ${telaAtual === 'clientes' || telaAtual === 'explorador' ? 'text-indigo-600' : 'text-zinc-400 group-hover:text-zinc-900'}`} 
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            {!recolhido && <span className="truncate">Clientes & Arquivos</span>}
          </button>
        </nav>
      </div>

      {/* RODAPÉ DO MENU (STATUS DO USUÁRIO) */}
      {!recolhido && (
        <div className="pt-4 border-t border-zinc-100">
          <div className="flex items-center gap-3 px-2 py-1.5 bg-zinc-50 rounded-xl border border-zinc-200/60">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
              VS
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-zinc-900 truncate">Vitor Spornraft</p>
              <p className="text-[10px] text-zinc-400 truncate">Analista & Desenvolvedor</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}