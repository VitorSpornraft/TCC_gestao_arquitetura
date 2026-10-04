const inputClass =
  "w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all";

function Field({ label, children, required = false }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function EventModal({
  evento,
  projetos = [],
  onChange,
  onClose,
  onSubmit,
}) {
  if (!evento) return null;

  const isEdicao = Boolean(evento.id);

  const field = (nome) => ({
    value: evento[nome] ?? "",
    onChange: (event) =>
      onChange({
        ...evento,
        [nome]: event.target.value,
      }),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-5 animate-slideUp">
        <header className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 m-0">
              {isEdicao ? "Editar Evento" : "Agendar Novo Evento"}
            </h3>
            <p className="text-xs text-zinc-500 m-0 mt-0.5">
              {isEdicao
                ? "Atualize as informações do compromisso"
                : "Preencha os detalhes para incluir na agenda"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-900 text-lg transition-colors p-1 cursor-pointer"
          >
            ✕
          </button>
        </header>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Título do Evento" required>
            <input
              type="text"
              required
              placeholder="Ex: Reunião de Alinhamento com Cliente"
              className={inputClass}
              {...field("titulo")}
              autoFocus
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Data" required>
              <input
                type="date"
                required
                className={inputClass}
                {...field("data")}
              />
            </Field>

            <Field label="Horário">
              <input
                type="time"
                className={inputClass}
                {...field("horario")}
              />
            </Field>
          </div>

          <Field label="Vincular à Obra (Opcional)">
            <select className={inputClass} {...field("projeto")}>
              <option value="">Nenhuma obra específica</option>
              {projetos.map((projeto) => (
                <option key={projeto.id} value={projeto.id}>
                  {projeto.nome_projeto || `Obra #${projeto.id}`}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Descrição / Observações">
            <textarea
              rows="3"
              placeholder="Detalhes sobre a reunião, local ou pauta..."
              className={inputClass}
              {...field("descricao")}
            />
          </Field>

          <label className="flex items-center gap-2.5 text-xs font-semibold text-zinc-700 cursor-pointer p-3 bg-zinc-50 rounded-xl border border-zinc-200 transition-colors hover:bg-zinc-100/70">
            <input
              type="checkbox"
              checked={Boolean(evento.concluido)}
              onChange={(e) =>
                onChange({
                  ...evento,
                  concluido: e.target.checked,
                })
              }
              className="w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
            />
            <span>Marcar compromisso como concluído</span>
          </label>

          <footer className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              {isEdicao ? "Salvar Alterações" : "Salvar Evento"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

