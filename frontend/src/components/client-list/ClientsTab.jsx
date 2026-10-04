import { filterClients } from "./projectUtils";

export default function ClientsTab({
  clientes = [],
  busca = "",
  filtroStatusCliente = "ativos",
  aoDeletarCliente,
  aoEditarCliente,
  aoRestaurarCliente,
  onAbrirNovoCliente,
}) {
  const clientesFiltrados = filterClients(clientes, {
    busca,
    filtroStatusCliente,
  });

  if (clientesFiltrados.length === 0) {
    return (
      <div className="text-center py-12 px-4 text-zinc-400 bg-white rounded-2xl border border-zinc-200/80 shadow-xs space-y-3">
        <p className="text-sm font-medium text-zinc-600 m-0">
          Nenhum cliente encontrado.
        </p>
        <p className="text-xs text-zinc-400 m-0">
          {busca
            ? "Tente alterar os termos de busca."
            : "Você pode adicionar um novo cliente clicando no botão abaixo."}
        </p>
        {onAbrirNovoCliente && (
          <button
            type="button"
            onClick={onAbrirNovoCliente}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer mt-2"
          >
            + Novo Cliente
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {clientesFiltrados.map((cliente) => {
        const isDeletado = Boolean(cliente.deletado);
        const numeroCadastro = String(cliente.id).padStart(4, "0");

        return (
          <div
            key={cliente.id}
            className={`bg-white border rounded-2xl p-4 shadow-xs transition-all flex items-center justify-between gap-3 ${
              isDeletado
                ? "border-zinc-200/60 bg-zinc-50/70"
                : "border-zinc-200/90 hover:shadow-md hover:border-indigo-300"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-2xs ${
                  isDeletado
                    ? "bg-zinc-200 text-zinc-500"
                    : "bg-indigo-600 text-white"
                }`}
              >
                {cliente.nome ? cliente.nome.charAt(0).toUpperCase() : "C"}
              </div>

              <div className="min-w-0">
                <h4 className="text-zinc-900 text-sm font-semibold truncate m-0">
                  {cliente.nome}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-mono text-xs font-semibold">
                    Nº {numeroCadastro}
                  </span>
                  {cliente.codigo_acesso && (
                    <span className="text-[11px] text-zinc-400 font-mono">
                      Cód: {cliente.codigo_acesso}
                    </span>
                  )}
                  {isDeletado && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                      Excluído
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-1">
              {isDeletado ? (
                <button
                  type="button"
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-2 rounded-xl transition-colors cursor-pointer"
                  title="Restaurar Cliente"
                  onClick={() => aoRestaurarCliente(cliente.id, cliente.nome)}
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
                    <polyline points="9 14 4 9 9 4" />
                    <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                  </svg>
                </button>
              ) : (
                <>
                  {aoEditarCliente && (
                    <button
                      type="button"
                      className="text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-xl transition-colors cursor-pointer"
                      title="Editar Cliente"
                      onClick={() => aoEditarCliente(cliente)}
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
                  <button
                    type="button"
                    className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-colors cursor-pointer"
                    title="Excluir Cliente"
                    onClick={() => aoDeletarCliente(cliente.id, cliente.nome)}
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
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
