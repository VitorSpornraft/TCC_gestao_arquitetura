const ICONS = {
  projetos: "⌂",
  concluidas: "✓",
  documentos: "▤",
  eficiencia: "↗",
};

export default function MetricsGrid({ metrics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <article key={metric.label} className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{metric.label}</span>
            <span className={`p-2 rounded-xl ${metric.iconClass}`}>{ICONS[metric.icon]}</span>
          </div>
          <div className="my-4"><span className="text-3xl font-extrabold text-zinc-900 tracking-tight">{metric.value}</span></div>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md inline-block w-fit ${metric.badgeClass}`}>{metric.description}</span>
        </article>
      ))}
    </div>
  );
}
