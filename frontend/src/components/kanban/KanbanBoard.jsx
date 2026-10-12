import TaskCard from "./TaskCard";

export default function KanbanBoard({
  colunasConfig,
  colunaSobreArrasto,
  setColunaSobreArrasto,
  aoMoverTarefa,
  projetos,
  clientes,
  arquivos = [],
  isAtrasado,
  cardArrastando,
  setCardArrastando,
  setTarefaModal,
  duplicarTarefa,
  confirmarDelecao,
  aoRestaurarTarefa,
  badgePrioridade,
  aoToggleSubtarefa,
  novaSubtarefaText,
  setNovaSubtarefaText,
  aoAdicionarSubtarefa,
}) {
  return (
    <div className="flex gap-6 w-full overflow-x-auto overflow-y-hidden h-[calc(100vh-200px)] pb-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
      {colunasConfig.map((col, idx) => (
        <div
          key={idx}
          className={`border rounded-2xl p-5 flex flex-col max-h-full flex-1 min-w-[320px] ${col.estiloColuna} ${
            colunaSobreArrasto === col.statusKey
              ? "ring-2 ring-indigo-400 bg-indigo-50/80"
              : ""
          }`}
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
          <div className="flex justify-between items-center mb-4 px-1 shrink-0">
            <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
              {col.titulo}
            </h3>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${col.estiloBadge}`}
            >
              {col.lista.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden p-1 flex flex-col gap-3.5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {col.lista.map((t) => {
              const projetoObj = projetos.find((p) => p.id === t.projeto);
              const clienteObj = projetoObj
                ? clientes.find((c) => c.id === projetoObj.cliente)
                : null;

              const arquivosDaTarefa = arquivos.filter(
                (a) => String(a.tarefa) === String(t.id)
              );

              return (
                <TaskCard
                  key={t.id}
                  tarefa={t}
                  projetoObj={projetoObj}
                  clienteObj={clienteObj}
                  arquivosDaTarefa={arquivosDaTarefa}
                  isArrastando={cardArrastando === t.id}
                  setCardArrastando={setCardArrastando}
                  setTarefaModal={setTarefaModal}
                  duplicarTarefa={duplicarTarefa}
                  confirmarDelecao={confirmarDelecao}
                  aoRestaurarTarefa={aoRestaurarTarefa}
                  badgePrioridade={badgePrioridade}
                  isAtrasado={isAtrasado}
                  aoToggleSubtarefa={aoToggleSubtarefa}
                  novaSubtarefaText={novaSubtarefaText}
                  setNovaSubtarefaText={setNovaSubtarefaText}
                  aoAdicionarSubtarefa={aoAdicionarSubtarefa}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
