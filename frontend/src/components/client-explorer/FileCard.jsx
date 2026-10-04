import ApprovalStatusBadge from "../common/ApprovalStatusBadge";

export default function FileCard({
  arq,
  nomeExibicao,
  qtdVersoes,
  isSelecaoMode,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onClick,
  onToggleVisibilidade,
  onGerenciarVersoes,
  onDeletar,
}) {
  return (
    <div
      onClick={() => onClick(arq)}
      draggable={!isSelecaoMode}
      onDragStart={(e) => onDragStart && onDragStart(e, arq)}
      onDragEnd={(e) => onDragEnd && onDragEnd(e)}
      className={`p-4 bg-white border rounded-2xl flex items-center justify-between w-full gap-3 shadow-xs transition-all cursor-pointer group relative ${
        isDragging
          ? "opacity-35 scale-95 border-dashed border-indigo-400 bg-indigo-50/20 shadow-none ring-2 ring-indigo-300/30"
          : isSelecaoMode
            ? "border-indigo-300 hover:bg-indigo-50 ring-2 ring-transparent hover:ring-indigo-400"
            : "border-slate-200/90 hover:border-indigo-300 hover:shadow-md cursor-grab active:cursor-grabbing"
      }`}
    >
      {/* BLOCO DA ESQUERDA: Ícone + Nome + Subtítulo */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Indicador sutil de arrastar */}
        {!isSelecaoMode && (
          <span
            className="text-slate-300 group-hover:text-slate-400 shrink-0 transition-colors p-0.5"
            title="Arraste para mover para uma pasta"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="8" cy="5" r="2" />
              <circle cx="8" cy="12" r="2" />
              <circle cx="8" cy="19" r="2" />
              <circle cx="16" cy="5" r="2" />
              <circle cx="16" cy="12" r="2" />
              <circle cx="16" cy="19" r="2" />
            </svg>
          </span>
        )}

        {/* Ícone do arquivo */}
        <div
          className={`p-2.5 rounded-xl shrink-0 transition-colors ${
            isSelecaoMode
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600"
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
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
        </div>

        {/* Container de textos: ocupa todo o espaço livre e trunca suavemente */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <strong
              className="text-sm font-medium text-slate-900 truncate text-ellipsis overflow-hidden block group-hover:text-indigo-600 transition-colors"
              title={nomeExibicao}
            >
              {nomeExibicao}
            </strong>
            {qtdVersoes > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                v{qtdVersoes + 1}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400 block truncate mt-0.5">
            {isSelecaoMode ? "Clique para substituir" : "Clique para exibir"}
          </span>
        </div>
      </div>

      {/* BLOCO DA DIREITA: Status + Contador de Comentários + Botão do Olho + Ações */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Status de Aprovação */}
        <ApprovalStatusBadge status={arq.status_aprovacao} size="sm" />

        {/* Contador de Comentários (Pill suave) */}
        {arq.feedbacks?.length > 0 && (
          <span
            className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium border border-gray-200/80 shadow-2xs"
            title={`${arq.feedbacks.length} feedback(s) registrado(s)`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-500"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>{arq.feedbacks.length}</span>
          </span>
        )}

        {/* Botão de Visibilidade do Cliente (Olho) */}
        {!isSelecaoMode && (
          <button
            type="button"
            onClick={(e) => onToggleVisibilidade(e, arq)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
              arq.visivel_cliente
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200 hover:text-slate-600"
            }`}
            title={
              arq.visivel_cliente
                ? "Visível para o cliente (clique para ocultar)"
                : "Oculto para o cliente (clique para exibir)"
            }
          >
            {arq.visivel_cliente ? (
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
        )}

        {/* Ações adicionais no hover (Histórico de Versões e Deletar) */}
        {!isSelecaoMode && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
            <button
              type="button"
              onClick={(e) => onGerenciarVersoes(e, arq)}
              className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Histórico de Versões"
            >
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
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => onDeletar(e, arq.id, nomeExibicao)}
              className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Excluir Arquivo"
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
