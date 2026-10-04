import { formatarNomeArquivo, getFileUrl } from "../client-explorer/fileUtils";

function getFileVersion(arquivo, arquivos) {
  const raizId = arquivo.versao_de
    ? typeof arquivo.versao_de === "object" ? arquivo.versao_de.id : arquivo.versao_de
    : arquivo.id;
  const versoesAnteriores = arquivos.filter((item) => {
    const paiId = item.versao_de ? typeof item.versao_de === "object" ? item.versao_de.id : item.versao_de : null;
    return String(paiId) === String(raizId) && new Date(item.criado_em || 0) <= new Date(arquivo.criado_em || 0);
  });
  return arquivo.versao_de ? versoesAnteriores.length + 1 : 1;
}

export default function RecentFilesAudit({ arquivos, projetos, arquivosRecentes }) {
  return (
    <section className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div><h3 className="text-base font-bold text-zinc-900 m-0">Trilha de Auditoria - Últimos Documentos Movimentados</h3><p className="text-xs text-zinc-500 m-0 mt-0.5">Registro cronológico de uploads e novas versões enviadas nas obras.</p></div>
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{arquivos.length} arquivos no total</span>
      </div>
      {arquivosRecentes.length === 0 ? <div className="p-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 rounded-xl">Nenhum documento cadastrado no sistema até o momento.</div> : (
        <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead><tr className="border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase tracking-wider"><th className="pb-3 font-semibold">Nome do Arquivo</th><th className="pb-3 font-semibold">Tipo / Status</th><th className="pb-3 font-semibold">Data de Envio</th><th className="pb-3 font-semibold text-right">Ação</th></tr></thead>
          <tbody className="divide-y divide-zinc-100 text-xs">{arquivosRecentes.map((arquivo) => {
            const numeroVersao = getFileVersion(arquivo, arquivos);
            const isVersao = Boolean(arquivo.versao_de);
            const obra = projetos.find((projeto) => String(projeto.id) === String(arquivo.projeto?.id || arquivo.projeto));
            const nomeExibicao = arquivo.nome || formatarNomeArquivo(arquivo.arquivo);
            return <tr key={arquivo.id} className="hover:bg-zinc-50/50 transition-colors"><td className="py-3.5"><div className="flex items-center gap-2"><span className="font-medium text-zinc-900 truncate max-w-[220px]" title={nomeExibicao}>{nomeExibicao}</span><span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200 shrink-0">v{numeroVersao}</span></div><div className="text-[11px] text-zinc-400 truncate mt-0.5">Obra: <span className="font-medium text-zinc-600">{obra ? obra.nome_projeto || "Obra sem título" : "Geral"}</span></div></td><td className="py-3.5"><span className={`inline-block px-2 py-0.5 rounded-md font-semibold text-[10px] ${isVersao ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-indigo-50 text-indigo-700 border border-indigo-100"}`}>{isVersao ? `Revisão v${numeroVersao}` : "Versão Original (v1)"}</span></td><td className="py-3.5 text-zinc-500">{arquivo.criado_em ? new Date(arquivo.criado_em).toLocaleDateString("pt-BR") : "Data não registrada"}</td><td className="py-3.5 text-right"><a href={getFileUrl(arquivo.arquivo)} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-semibold">Visualizar</a></td></tr>;
          })}</tbody></table></div>
      )}
    </section>
  );
}
