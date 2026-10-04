import { formatarNomeArquivo } from "../fileUtils";

/**
 * Modal de confirmação visual para mover arquivo entre pastas
 */
export default function MoveFileModal({
  confirmacao,
  estaMovendo,
  erro,
  onConfirmar,
  onCancelar,
}) {
  if (!confirmacao) return null;

  const { arquivo, pastaDestino } = confirmacao;
  const nomeArquivo = arquivo?.nome || formatarNomeArquivo(arquivo?.arquivo);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="move-file-title"
    >
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-5 animate-slideUp">
        <header className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div>
              <h3 id="move-file-title" className="text-base font-bold text-zinc-900 m-0">
                Mover Arquivo
              </h3>
              <p className="text-xs text-zinc-500 m-0 mt-0.5">
                Confirme a alteração de pasta do documento
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancelar}
            disabled={estaMovendo}
            className="text-zinc-400 hover:text-zinc-700 text-lg transition-colors p-1 cursor-pointer disabled:opacity-50"
            aria-label="Fechar"
          >
            ✕
          </button>
        </header>

        {/* Card visual de Origem -> Destino */}
        <div className="p-4 bg-zinc-50/80 border border-zinc-200/80 rounded-xl space-y-3">
          <div className="flex items-center justify-between gap-3 text-xs">
            {/* Item de Origem (Arquivo) */}
            <div className="flex-1 min-w-0 bg-white p-3 rounded-lg border border-zinc-200/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Documento
              </span>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-indigo-500 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                  <polyline points="13 2 13 9 20 9" />
                </svg>
                <span className="font-semibold text-zinc-800 truncate" title={nomeArquivo}>
                  {nomeArquivo}
                </span>
              </div>
            </div>

            {/* Ícone de Seta de transferência */}
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-full shrink-0 shadow-2xs">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>

            {/* Item de Destino (Pasta) */}
            <div className="flex-1 min-w-0 bg-white p-3 rounded-lg border border-indigo-200 shadow-2xs bg-indigo-50/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block mb-1">
                Pasta Destino
              </span>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-indigo-600 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                <span className="font-semibold text-zinc-900 truncate" title={pastaDestino?.nome}>
                  {pastaDestino?.nome}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed m-0 pt-1">
            Deseja realmente mover o arquivo <strong className="text-zinc-900 font-semibold">"{nomeArquivo}"</strong> para a pasta <strong className="text-indigo-700 font-semibold">"{pastaDestino?.nome}"</strong>? O histórico de versões também será transferido.
          </p>
        </div>

        {erro && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {erro}
          </div>
        )}

        <footer className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
          <button
            type="button"
            onClick={onCancelar}
            disabled={estaMovendo}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={estaMovendo}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
          >
            {estaMovendo ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Movendo...</span>
              </>
            ) : (
              <span>Confirmar e Mover</span>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
