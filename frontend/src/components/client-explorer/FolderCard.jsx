export default function FolderCard({
  pasta,
  qtdArquivos,
  isSelecaoMode,
  isDropTarget = false,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onEntrarPasta,
  onToggleVisibilidade,
  onEditar,
  onDeletar,
}) {
  return (
    <div
      onClick={() => onEntrarPasta(pasta)}
      onDragOver={(e) => onDragOver && onDragOver(e, pasta)}
      onDragEnter={(e) => onDragEnter && onDragEnter(e, pasta)}
      onDragLeave={(e) => onDragLeave && onDragLeave(e, pasta)}
      onDrop={(e) => onDrop && onDrop(e, pasta)}
      className={`p-4 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all group relative ${
        isDropTarget
          ? "bg-indigo-50/90 border-2 border-dashed border-indigo-500 ring-2 ring-indigo-400/40 shadow-md scale-[1.02]"
          : "bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-3.5 overflow-hidden">
        <div
          className={`p-2.5 rounded-xl transition-colors shrink-0 ${
            isDropTarget
              ? "bg-indigo-600 text-white"
              : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
          }`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-2">
            <strong className="text-sm font-semibold text-slate-900 block truncate group-hover:text-indigo-600 transition-colors">
              {pasta.nome}
            </strong>
            {isDropTarget && (
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 animate-pulse shrink-0">
                Solte aqui
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-400">Pasta</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              {qtdArquivos} {qtdArquivos === 1 ? "arquivo" : "arquivos"}
            </span>
            {/* INDICADOR DE VISIBILIDADE DA PASTA */}
            {pasta.visivel_cliente ? (
              <span
                className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1"
                title="Visível para o cliente"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </span>
            ) : (
              <span
                className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1"
                title="Oculto para o cliente"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </span>
            )}
          </div>
        </div>
      </div>
      {!isSelecaoMode && (
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity bg-white/95 p-1 rounded-lg border border-slate-100 shadow-xs shrink-0">
          {/* BOTÃO DE AÇÃO: TOGGLE VISIBILIDADE PASTA */}
          <button
            type="button"
            onClick={(e) => onToggleVisibilidade(e, pasta)}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-1.5 rounded-md transition-colors"
            title={
              pasta.visivel_cliente
                ? "Ocultar do cliente"
                : "Tornar visível para o cliente"
            }
          >
            {pasta.visivel_cliente ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={(e) => onEditar(e, pasta)}
            className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-md transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => onDeletar(e, pasta.id, pasta.nome)}
            className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-md transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
