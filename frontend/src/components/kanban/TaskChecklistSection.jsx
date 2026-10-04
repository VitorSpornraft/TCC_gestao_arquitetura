export default function TaskChecklistSection({
  tarefaModal,
  aoToggleSubtarefa,
  aoDeletarSubtarefa,
  novaSubtarefaModalText,
  setNovaSubtarefaModalText,
  aoAdicionarSubtarefa,
}) {
  const concluidasCount =
    tarefaModal.subtarefas?.filter((s) => s.concluida).length || 0;
  const totalCount = tarefaModal.subtarefas?.length || 0;

  const handleAdd = () => {
    if (!novaSubtarefaModalText.trim()) return;
    aoAdicionarSubtarefa(tarefaModal.id, novaSubtarefaModalText);
    setNovaSubtarefaModalText("");
  };

  return (
    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/80 space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Itens do Checklist
        </label>
        <span className="text-xs text-indigo-600 font-medium">
          {concluidasCount} de {totalCount} concluídos
        </span>
      </div>

      <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
        {tarefaModal.subtarefas &&
          tarefaModal.subtarefas.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-zinc-200 shadow-2xs"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={sub.concluida}
                  onChange={() => aoToggleSubtarefa(sub, tarefaModal.id)}
                  className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer accent-indigo-600 shrink-0"
                />
                <span
                  className={`text-sm truncate ${
                    sub.concluida ? "line-through text-zinc-400" : "text-zinc-700"
                  }`}
                >
                  {sub.titulo}
                </span>
              </div>
              <button
                type="button"
                onClick={() => aoDeletarSubtarefa(sub.id, tarefaModal.id)}
                className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded transition-colors shrink-0 ml-2 cursor-pointer"
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
          ))}
      </div>

      <div className="flex gap-2 pt-1">
        <input
          className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
          placeholder="Adicionar novo item ao checklist..."
          value={novaSubtarefaModalText}
          onChange={(e) => setNovaSubtarefaModalText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <button
          type="button"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer"
          onClick={handleAdd}
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}
