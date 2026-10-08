import ApprovalStatusBadge from "../common/ApprovalStatusBadge";
import { resolverArquivosVersaoRecente } from "../client-explorer/fileUtils";

export default function TaskDocumentsSection({
  arquivos,
  tarefaProjetoId,
  aoAbrirHistorico,
}) {
  const arquivosDaObra = (arquivos || []).filter((a) => {
    if (!a) return false;
    const projId = typeof a.projeto === "object" ? a.projeto?.id : a.projeto;
    return String(projId) === String(tarefaProjetoId);
  });
  const documentos = resolverArquivosVersaoRecente(arquivosDaObra);

  return (
    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider">
          Documentos da Obra
        </label>
      </div>
      <p className="text-xs text-zinc-500 m-0">
        Arquivos disponíveis, status de aprovação e histórico:
      </p>
      <div className="max-h-36 overflow-y-auto space-y-1.5 pt-1">
        {documentos.map((arq) => {
          const nomeArq = arq.arquivo
            ? arq.arquivo.split("/").pop()
            : "Documento";
          return (
            <div
              key={arq.id}
              className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-indigo-100 text-xs gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="truncate text-zinc-800 font-medium" title={nomeArq}>
                  {nomeArq}
                </span>
                <ApprovalStatusBadge status={arq.status_aprovacao} size="xs" />
                {arq.feedbacks?.length > 0 && (
                  <span
                    className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-1.5 py-0.2 rounded border border-indigo-200 shrink-0"
                    title={`${arq.feedbacks.length} feedback(s)`}
                  >
                    💬 {arq.feedbacks.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => aoAbrirHistorico(arq)}
                  className="text-zinc-500 hover:text-indigo-600 hover:underline font-medium cursor-pointer"
                >
                  Histórico
                </button>
                <a
                  href={arq.arquivo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Baixar
                </a>
              </div>
            </div>
          );
        })}
        {documentos.length === 0 && (
          <p className="text-xs text-zinc-400 italic py-1">
            Nenhum documento anexado a esta obra.
          </p>
        )}
      </div>
    </div>
  );
}
