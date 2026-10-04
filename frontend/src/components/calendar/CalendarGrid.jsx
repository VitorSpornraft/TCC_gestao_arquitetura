const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function CalendarGrid({ ano, mes, primeiroDiaMes, totalDiasMes, diaSelecionado, compromissos, onSelectDay }) {
  return (
    <section className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-2xs lg:col-span-2">
      <div className="grid grid-cols-7 gap-2 mb-4 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">{WEEKDAYS.map((dia) => <span key={dia}>{dia}</span>)}</div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: primeiroDiaMes }).map((_, index) => <div key={`empty-${index}`} className="h-24 bg-transparent" />)}
        {Array.from({ length: totalDiasMes }).map((_, index) => {
          const dia = index + 1;
          const data = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
          const selecionado = data === diaSelecionado;
          const total = compromissos.filter((compromisso) => compromisso.data === data).length;
          return <button key={dia} type="button" onClick={() => onSelectDay(data)} className={`h-24 p-2.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer text-left ${selecionado ? "bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-500/20" : "bg-zinc-50/50 hover:bg-zinc-100/80 border-zinc-200/60 text-zinc-800"}`}><div className="flex items-center justify-between"><span className={`text-xs font-bold ${selecionado ? "text-white" : "text-zinc-700"}`}>{dia}</span>{total > 0 && <span className={`w-2 h-2 rounded-full ${selecionado ? "bg-white" : "bg-indigo-600"}`} />}</div>{total > 0 && <span className={`text-[10px] truncate font-medium ${selecionado ? "text-indigo-100" : "text-zinc-400"}`}>{total} evento(s)</span>}</button>;
        })}
      </div>
    </section>
  );
}
