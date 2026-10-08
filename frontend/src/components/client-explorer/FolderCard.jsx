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
      className={`p-4 sm:p-5 rounded-2xl flex flex-col justify-between w-full shadow-xs transition-all cursor-pointer group relative min-h-[140px] ${
        isDropTarget
          ? "bg-indigo-50/90 border-2 border-dashed border-indigo-500 ring-2 ring-indigo-400/40 shadow-md scale-[1.02]"
          : isSelecaoMode
            ? "bg-white border border-slate-200/90 opacity-60 cursor-not-allowed"
            : "bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-md"
      }`}
    >
      {/* CABEÇALHO DO CARD: Ícone da Pasta, Nome, Tag e Subtítulo */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Ícone da Pasta */}
          <div
            className={`p-2.5 rounded-xl shrink-0 transition-colors ${
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

          {/* Container de textos: Nome e Subtítulo */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <strong
                className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2 break-all"
                title={pasta.nome}
              >
                {pasta.nome}
              </strong>
              {isDropTarget ? (
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 animate-pulse shrink-0">
                  Solte aqui
                </span>
              ) : (
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                  Pasta
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 m-0 mt-1">
              {isDropTarget
                ? "Solte para mover aqui"
                : "Clique para abrir pasta"}
            </p>
          </div>
        </div>
      </div>

      {/* RODAPÉ DO CARD: Contador de Arquivos & Ações */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 gap-2 flex-wrap">
        {/* Esquerda: Contador de Arquivos contidos */}
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1.5">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-400"
            >
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
            <span>
              {qtdArquivos} {qtdArquivos === 1 ? "arquivo" : "arquivos"}
            </span>
          </span>
        </div>

        {/* Direita: Botões de Ação */}
        {!isSelecaoMode && (
          <div
            className="flex items-center gap-1 shrink-0 ml-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Toggle de Visibilidade da Pasta */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibilidade(e, pasta);
              }}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
                pasta.visivel_cliente
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600"
              }`}
              title={
                pasta.visivel_cliente
                  ? "Visível para o cliente (clique para ocultar)"
                  : "Oculto para o cliente (clique para exibir)"
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
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
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
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </button>

            {/* Editar / Renomear Pasta */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditar(e, pasta);
              }}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
              title="Renomear Pasta"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>

            {/* Excluir Pasta */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeletar(e, pasta.id, pasta.nome);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Excluir Pasta"
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
    </div>
  );
}
