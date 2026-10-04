const baseInputClass =
  "bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all";
const inputClass = `w-full ${baseInputClass}`;

export default function ClientSection({
  isEdicao,
  modoCliente,
  setModoCliente,
  clientes = [],
  clienteId,
  setClienteId,
  cliente,
  setCliente,
  onDDDChange,
  onTelefoneChange,
}) {
  const update = (field, value) => setCliente({ ...cliente, [field]: value });

  return (
    <section className="bg-zinc-50 border border-zinc-200/80 p-4 rounded-xl space-y-3.5">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider m-0">
          Dados do Cliente
        </h4>
        {!isEdicao && (
          <div className="flex gap-4">
            <label className="text-xs font-medium text-zinc-700 cursor-pointer flex items-center gap-1.5">
              <input
                type="radio"
                checked={modoCliente === "existente"}
                onChange={() => setModoCliente("existente")}
                className="accent-indigo-600"
              />
              Existente
            </label>
            <label className="text-xs font-medium text-zinc-700 cursor-pointer flex items-center gap-1.5">
              <input
                type="radio"
                checked={modoCliente === "novo"}
                onChange={() => setModoCliente("novo")}
                className="accent-indigo-600"
              />
              Novo
            </label>
          </div>
        )}
      </div>

      {modoCliente === "existente" ? (
        <select
          className={`${inputClass} cursor-pointer`}
          value={clienteId}
          onChange={(event) => setClienteId(event.target.value)}
          required
          disabled={isEdicao}
        >
          <option value="">Selecione um cliente da lista...</option>
          {clientes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nome}
            </option>
          ))}
        </select>
      ) : (
        <div className="space-y-3">
          <div>
            <input
              className={inputClass}
              placeholder="Nome Completo *"
              required
              value={cliente.nome}
              onChange={(event) => update("nome", event.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <input
              className={`w-16 shrink-0 ${baseInputClass} text-center`}
              placeholder="DDI"
              value={cliente.ddi}
              onChange={(event) => update("ddi", event.target.value)}
            />
            <input
              className={`w-16 shrink-0 ${baseInputClass} text-center`}
              placeholder="DDD"
              maxLength={2}
              value={cliente.ddd}
              onChange={onDDDChange}
            />
            <input
              className={`flex-1 min-w-0 ${baseInputClass}`}
              placeholder="Número de Telefone"
              value={cliente.telefone}
              onChange={onTelefoneChange}
            />
          </div>
        </div>
      )}
    </section>
  );
}
