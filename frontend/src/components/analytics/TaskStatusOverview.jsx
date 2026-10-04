const STATUS_STYLES = {
  WIP: { label: "Trabalho em Curso (WIP)", bar: "bg-zinc-500", card: "bg-zinc-50 border-zinc-200/60 text-zinc-800", dot: "bg-zinc-400" },
  SHARED: { label: "Compartilhado (Shared)", bar: "bg-indigo-600", card: "bg-indigo-50/50 border-indigo-100 text-indigo-900", dot: "bg-indigo-600" },
  PUBLISHED: { label: "Publicado (Published)", bar: "bg-emerald-600", card: "bg-emerald-50/50 border-emerald-100 text-emerald-900", dot: "bg-emerald-600" },
};

export default function TaskStatusOverview({ totalTarefas, statusCounts }) {
  const statuses = Object.entries(statusCounts).map(([status, quantidade]) => ({
    status,
    quantidade,
    ...STATUS_STYLES[status],
  }));

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-2xs lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-900 m-0">Volume de Tarefas por Status</h3>
          <span className="text-xs text-zinc-400 font-medium">Visão Geral</span>
        </div>
        <div className="space-y-4 pt-2">
          {statuses.map((item) => {
            const porcentagem = totalTarefas > 0 ? (item.quantidade / totalTarefas) * 100 : 0;
            return (
              <div key={item.status} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-700">{item.label}</span>
                  <span className="text-zinc-500">{item.quantidade} tarefas ({Math.round(porcentagem)}%)</span>
                </div>
                <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden">
                  <div className={`${item.bar} h-full rounded-full transition-all duration-500`} style={{ width: `${porcentagem}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-zinc-900 m-0">Distribuição do Kanban</h3>
        <p className="text-xs text-zinc-500 m-0">Status atual das demandas arquitetônicas.</p>
        <div className="space-y-3 pt-2">
          {statuses.map((item) => (
            <div key={item.status} className={`flex items-center justify-between p-3.5 rounded-xl border ${item.card}`}>
              <div className="flex items-center gap-3"><span className={`w-3 h-3 rounded-full ${item.dot}`} /><span className="text-xs font-semibold">{item.label}</span></div>
              <span className="text-sm font-bold">{item.quantidade}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
