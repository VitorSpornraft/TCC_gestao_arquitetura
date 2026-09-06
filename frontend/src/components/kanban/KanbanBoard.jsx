export default function KanbanBoard({ colunasConfig, colunaSobreArrasto, setColunaSobreArrasto, aoMoverTarefa, projetos, clientes, isAtrasado, cardArrastando, setCardArrastando, setTarefaModal, duplicarTarefa, confirmarDelecao, aoRestaurarTarefa, badgePrioridade, aoToggleSubtarefa, novaSubtarefaText, setNovaSubtarefaText, aoAdicionarSubtarefa }) {
  return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {colunasConfig.map((col, idx) => (
          <div
            key={idx}
            className={`border rounded-2xl p-5 flex flex-col min-h-[580px] w-full ${col.estiloColuna} ${colunaSobreArrasto === col.statusKey ? "ring-2 ring-indigo-400 bg-indigo-50/80" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setColunaSobreArrasto(col.statusKey);
            }}
            onDragLeave={() => setColunaSobreArrasto(null)}
            onDrop={(e) => {
              e.preventDefault();
              setColunaSobreArrasto(null);
              aoMoverTarefa(e.dataTransfer.getData("tarefaId"), col.statusKey);
            }}
          >
            <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                {col.titulo}
              </h3>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${col.estiloBadge}`}
              >
                {col.lista.length}
              </span>
            </div>

            <div className="flex flex-col gap-3.5">
              {col.lista.map((t) => {
                const projetoObj = projetos.find((p) => p.id === t.projeto);
                const clienteObj = projetoObj
                  ? clientes.find((c) => c.id === projetoObj.cliente)
                  : null;
                const totalSub = t.subtarefas?.length || 0;
                const concluidasSub =
                  t.subtarefas?.filter((s) => s.concluida).length || 0;
                const progresso =
                  totalSub > 0
                    ? Math.round((concluidasSub / totalSub) * 100)
                    : t.status === "REALIZADO"
                      ? 100
                      : 0;
                const atrasado = isAtrasado(t.prazo, t.status);

                return (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("tarefaId", t.id);
                      setCardArrastando(t.id);
                    }}
                    onDragEnd={() => setCardArrastando(null)}
                    onClick={(e) => {
                      if (e.target.closest("button, input, a, select, textarea, label")) {
                        return;
                      }
                      setTarefaModal(t);
                    }}
                    className={`bg-white border border-zinc-200/90 p-4 rounded-xl shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group ${cardArrastando === t.id ? "opacity-40 scale-[0.98]" : ""}`}
                  >
                    <div className="flex justify-between items-center pb-3 mb-3 border-b border-zinc-100">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        {clienteObj?.foto ? (
                          <img
                            src={clienteObj.foto}
                            className="w-7 h-7 rounded-full object-cover shrink-0 shadow-xs"
                            alt={clienteObj.nome}
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                            {clienteObj?.nome?.charAt(0) ||
                              projetoObj?.nome_projeto?.charAt(0) ||
                              "?"}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-zinc-900 truncate">
                            {clienteObj?.nome || "Cliente não atribuído"}
                          </span>
                          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-tight truncate">
                            {projetoObj?.nome_projeto || "Sem Obra"}
                          </span>
                        </div>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity shrink-0">
                        {t.arquivado ? (
                          <>
                            <button
                              type="button"
                              onClick={() => confirmarDelecao(t)}
                              className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Excluir permanentemente"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => aoRestaurarTarefa(t.id)}
                              className="text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Restaurar tarefa"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 14 4 9 9 4"></polyline>
                                <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={(e) => duplicarTarefa(t, e)}
                              className="text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Duplicar Tarefa"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                            </button>
                            <button
                              onClick={() => setTarefaModal(t)}
                              className="text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Editar Tarefa"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <button
                              onClick={() => confirmarDelecao(t)}
                              className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Arquivar tarefa"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <strong className="text-sm font-semibold text-zinc-900 block mb-2 leading-snug">
                      {t.titulo}
                    </strong>

                    <div className="flex items-center justify-between mb-3 gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block text-[10px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md font-semibold">
                          {t.categoria || "Geral"}
                        </span>
                        {badgePrioridade(t.prioridade)}
                      </div>

                      {t.prazo && (
                        <div
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0 border ${
                            atrasado
                              ? "bg-rose-50 border-rose-200 text-rose-700"
                              : "bg-zinc-50 border-zinc-200/80 text-zinc-600"
                          }`}
                        >
                          <svg
                            className={`w-3.5 h-3.5 ${atrasado ? "text-rose-500" : "text-indigo-500"}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="3"
                              y="4"
                              width="18"
                              height="18"
                              rx="2"
                              ry="2"
                            ></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          <span>{t.prazo.split("-").reverse().join("/")}</span>
                          {atrasado && (
                            <span className="font-bold ml-0.5">⚠️</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-zinc-100">
                      <div className="flex justify-between text-[11px] font-medium text-zinc-500">
                        <span>Progresso</span>
                        <span className="font-semibold text-zinc-700">
                          {progresso}%
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full transition-all duration-300"
                          style={{ width: `${progresso}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          Checklist
                        </span>
                        {totalSub > 0 && (
                          <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold text-[10px]">
                            {concluidasSub}/{totalSub}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                        {t.subtarefas &&
                          t.subtarefas.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer py-1 px-1.5 rounded-md hover:bg-zinc-50 transition-colors"
                              onClick={() => aoToggleSubtarefa(sub)}
                            >
                              <input
                                type="checkbox"
                                checked={sub.concluida}
                                readOnly
                                className="w-3.5 h-3.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer accent-indigo-600 shrink-0"
                              />
                              <span
                                className={`transition-colors truncate flex-1 ${sub.concluida ? "line-through text-zinc-400" : "text-zinc-700"}`}
                              >
                                {sub.titulo}
                              </span>
                            </div>
                          ))}
                      </div>

                      <div className="flex gap-1.5 pt-1">
                        <input
                          className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                          placeholder="Adicionar item..."
                          value={novaSubtarefaText[t.id] || ""}
                          onChange={(e) =>
                            setNovaSubtarefaText({
                              ...novaSubtarefaText,
                              [t.id]: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (!novaSubtarefaText[t.id]?.trim()) return;
                              aoAdicionarSubtarefa(
                                t.id,
                                novaSubtarefaText[t.id],
                              );
                              setNovaSubtarefaText({
                                ...novaSubtarefaText,
                                [t.id]: "",
                              });
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                          onClick={() => {
                            if (!novaSubtarefaText[t.id]?.trim()) return;
                            aoAdicionarSubtarefa(t.id, novaSubtarefaText[t.id]);
                            setNovaSubtarefaText({
                              ...novaSubtarefaText,
                              [t.id]: "",
                            });
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
  );
}
