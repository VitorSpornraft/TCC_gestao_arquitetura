export default function ConfirmActionModal({ titulo = "Confirmar ação", mensagem, textoConfirmar = "Confirmar", variante = "perigo", onConfirmar, onFechar }) {
  const estiloConfirmar = variante === "perigo"
    ? "bg-rose-600 hover:bg-rose-700"
    : variante === "aviso"
      ? "bg-amber-600 hover:bg-amber-700"
      : "bg-indigo-600 hover:bg-indigo-700";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-4 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="confirm-action-title">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl animate-slideUp">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${variante === "perigo" ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4"></path>
              <path d="M12 17h.01"></path>
              <path d="M10.3 3.9 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"></path>
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="confirm-action-title" className="m-0 text-base font-semibold text-zinc-900">{titulo}</h3>
            <p className="mt-1.5 mb-0 text-sm leading-relaxed text-zinc-600">{mensagem}</p>
          </div>
          <button type="button" onClick={onFechar} className="p-1 text-zinc-400 transition-colors hover:text-zinc-900 cursor-pointer" aria-label="Fechar">✕</button>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onFechar} className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 cursor-pointer">Cancelar</button>
          <button type="button" onClick={onConfirmar} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors cursor-pointer ${estiloConfirmar}`}>{textoConfirmar}</button>
        </div>
      </div>
    </div>
  );
}
