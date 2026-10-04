export default function FolderBreadcrumb({
  caminho,
  onSelectLevel,
  pastaDestinoHover,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
}) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs">
      <svg
        className="w-4 h-4 text-indigo-500 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
      {caminho.map((nivel, indice) => {
        const isAtual = indice === caminho.length - 1;
        const isHovered =
          !isAtual &&
          pastaDestinoHover !== null &&
          String(pastaDestinoHover) === String(nivel.id ?? "raiz");

        return (
          <div key={nivel.id || "raiz"} className="flex items-center gap-2">
            {indice > 0 && <span className="text-slate-300">/</span>}
            <button
              type="button"
              onClick={() => onSelectLevel(indice)}
              onDragOver={(e) => !isAtual && onDragOver && onDragOver(e, nivel)}
              onDragEnter={(e) => !isAtual && onDragEnter && onDragEnter(e, nivel)}
              onDragLeave={(e) => !isAtual && onDragLeave && onDragLeave(e)}
              onDrop={(e) => !isAtual && onDrop && onDrop(e, nivel)}
              className={`transition-all rounded-lg px-1.5 py-0.5 ${
                isAtual
                  ? "font-bold text-slate-900 pointer-events-none"
                  : isHovered
                    ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-400 font-bold animate-pulse cursor-copy"
                    : "hover:text-indigo-600 hover:bg-slate-50 cursor-pointer"
              }`}
              title={
                !isAtual
                  ? `Clique para navegar ou solte um arquivo para mover para "${nivel.nome}"`
                  : undefined
              }
            >
              {nivel.nome}
            </button>
          </div>
        );
      })}
    </div>
  );
}

