import { useState } from "react";

const NAV_ITEMS = [
  {
    id: "analytics",
    label: "Analytics",
    isActive: (telaAtual) => telaAtual === "analytics",
    onClick: (setTelaAtual) => setTelaAtual("analytics"),
    icon: (
      <svg
        className="w-5 h-5 shrink-0 transition-colors"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
    ),
  },
  {
    id: "kanban",
    label: "Quadro Kanban",
    isActive: (telaAtual) => telaAtual === "kanban",
    onClick: (setTelaAtual) => setTelaAtual("kanban"),
    icon: (
      <svg
        className="w-5 h-5 shrink-0 transition-colors"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="9" rx="1"></rect>
        <rect x="14" y="3" width="7" height="5" rx="1"></rect>
        <rect x="14" y="12" width="7" height="9" rx="1"></rect>
        <rect x="3" y="16" width="7" height="5" rx="1"></rect>
      </svg>
    ),
  },
  {
    id: "calendar",
    label: "Calendário",
    isActive: (telaAtual) => telaAtual === "calendar",
    onClick: (setTelaAtual) => setTelaAtual("calendar"),
    icon: (
      <svg
        className="w-5 h-5 shrink-0 transition-colors"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    ),
  },
  {
    id: "clientes",
    label: "Clientes & Arquivos",
    isActive: (telaAtual) => telaAtual === "clientes" || telaAtual === "explorador",
    onClick: (setTelaAtual, setClienteSelecionado) => {
      setTelaAtual("clientes");
      setClienteSelecionado(null);
    },
    icon: (
      <svg
        className="w-5 h-5 shrink-0 transition-colors"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
  },
];

export default function Navbar({
  telaAtual,
  setTelaAtual,
  setClienteSelecionado,
}) {
  const [recolhido, setRecolhido] = useState(false);

  const nomeUsuario =
    localStorage.getItem("usuario_nome") ||
    sessionStorage.getItem("usuario_nome") ||
    "Arquiteto(a)";
  const iniciais = nomeUsuario.substring(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario_nome");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario_nome");
    window.location.reload();
  };

  return (
    <aside
      className={`bg-white border-r border-zinc-200/80 transition-all duration-300 ease-in-out flex flex-col justify-between p-4 shrink-0 shadow-xs ${
        recolhido ? "w-20" : "w-64"
      }`}
    >
      <div>
        <div
          className={`flex items-center justify-between mb-8 ${recolhido ? "flex-col gap-4" : ""}`}
        >
          {!recolhido && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-zinc-900 tracking-tight m-0 truncate">
                Gestão Arquitetônica
              </h1>
              <span className="text-[11px] text-indigo-600 font-semibold tracking-wide uppercase">
                Ambiente Comum de Dados
              </span>
            </div>
          )}
          <button
            onClick={() => setRecolhido(!recolhido)}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
            title={recolhido ? "Expandir Menu" : "Recolher Menu"}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {recolhido ? (
                <polyline points="9 18 15 12 9 6"></polyline>
              ) : (
                <polyline points="15 18 9 12 15 6"></polyline>
              )}
            </svg>
          </button>
        </div>

        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const active = item.isActive(telaAtual);
            return (
              <button
                key={item.id}
                onClick={() => item.onClick(setTelaAtual, setClienteSelecionado)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group ${
                  active
                    ? "bg-indigo-50 text-indigo-600 shadow-2xs font-semibold"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
                title={item.label}
              >
                <span
                  className={
                    active
                      ? "text-indigo-600"
                      : "text-zinc-400 group-hover:text-zinc-900"
                  }
                >
                  {item.icon}
                </span>
                {!recolhido && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-zinc-100">
        {recolhido ? (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center p-2.5 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Encerrar Sessão"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        ) : (
          <div className="flex items-center justify-between px-2 py-1.5 bg-zinc-50 rounded-xl border border-zinc-200/60">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                {iniciais}
              </div>
              <div className="overflow-hidden">
                <p
                  className="text-xs font-semibold text-zinc-900 truncate"
                  title={nomeUsuario}
                >
                  {nomeUsuario}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">
                  Arquiteto(a)
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Encerrar Sessão"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
