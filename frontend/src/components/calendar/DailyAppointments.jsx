export default function DailyAppointments({
  data,
  compromissos = [],
  onEditarEvento,
  onToggleConcluido,
  onDeletarEvento,
  onNovoEvento,
}) {
  const dataFormatada = new Date(`${data}T00:00:00`).toLocaleDateString(
    "pt-BR",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  return (
    <aside className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col">
      <div className="pb-3 border-b border-zinc-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900 m-0">
            Compromissos do Dia
          </h3>
          <p className="text-xs text-zinc-500 m-0 mt-0.5 capitalize">
            {dataFormatada}
          </p>
        </div>
        {onNovoEvento && (
          <button
            type="button"
            onClick={onNovoEvento}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            + Agendar
          </button>
        )}
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto max-h-[420px]">
        {compromissos.length === 0 ? (
          <div className="text-center py-12 px-4 text-xs text-zinc-400 border border-dashed border-zinc-200 rounded-xl space-y-2">
            <p className="m-0">Nenhum evento ou prazo agendado para este dia.</p>
            {onNovoEvento && (
              <button
                type="button"
                onClick={onNovoEvento}
                className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer text-xs"
              >
                + Adicionar evento para este dia
              </button>
            )}
          </div>
        ) : (
          compromissos.map((compromisso) => {
            const isTarefa = compromisso.tipo === "tarefa";
            const isConcluido = Boolean(compromisso.concluido);

            return (
              <article
                key={compromisso.id}
                className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                  isTarefa
                    ? "bg-zinc-50/50 border-zinc-200/80"
                    : isConcluido
                      ? "bg-zinc-50/70 border-zinc-200/60 opacity-80"
                      : "bg-white border-zinc-200/80 shadow-2xs hover:border-indigo-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-200 text-zinc-700">
                      {compromisso.horario && compromisso.horario !== "23:59"
                        ? compromisso.horario.slice(0, 5)
                        : "Prazo Final"}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        isTarefa
                          ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                          : isConcluido
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-sky-50 text-sky-700 border-sky-200"
                      }`}
                    >
                      {isTarefa
                        ? "Kanban (Leitura)"
                        : isConcluido
                          ? "Concluído"
                          : "Agendado"}
                    </span>
                  </div>

                  {/* Ações disponíveis exclusivamente para eventos agendados no calendário (não para tarefas Kanban) */}
                  {!isTarefa && (
                    <div className="flex items-center gap-1">
                      {/* Botão de Concluir / Desconcluir */}
                      {onToggleConcluido && (
                        <button
                          type="button"
                          onClick={() =>
                            onToggleConcluido(compromisso.id, !isConcluido)
                          }
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isConcluido
                              ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                              : "text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={
                            isConcluido
                              ? "Desmarcar conclusão"
                              : "Marcar como concluído"
                          }
                        >
                          {isConcluido ? (
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                            </svg>
                          )}
                        </button>
                      )}

                      {/* Botão de Editar Evento */}
                      {onEditarEvento && (
                        <button
                          type="button"
                          onClick={() => onEditarEvento(compromisso)}
                          className="text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Editar Evento"
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      )}

                      {/* Botão de Excluir Evento */}
                      {onDeletarEvento && (
                        <button
                          type="button"
                          onClick={() =>
                            onDeletarEvento(compromisso.id, compromisso.titulo)
                          }
                          className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Evento"
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <h4
                    className={`text-sm font-bold m-0 truncate ${
                      !isTarefa && isConcluido
                        ? "line-through text-zinc-400"
                        : "text-zinc-900"
                    }`}
                  >
                    {compromisso.titulo}
                  </h4>
                  {compromisso.descricao && (
                    <p className="text-xs text-zinc-500 m-0 mt-1 line-clamp-2">
                      {compromisso.descricao}
                    </p>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </aside>
  );
}
