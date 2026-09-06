export default function TaskEditModal({ tarefaModal, setTarefaModal, aoSalvarEdicaoModal, projetos, arquivos, fileInputRef, uploadEntregavelTarefa, aoAbrirHistorico, aoToggleSubtarefa, aoDeletarSubtarefa, novaSubtarefaModalText, setNovaSubtarefaModalText, aoAdicionarSubtarefa }) {
  return tarefaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-zinc-100">
              <h3 className="text-lg font-semibold text-zinc-900 m-0">
                Detalhes & Entregável da Tarefa
              </h3>
              <button
                type="button"
                onClick={() => setTarefaModal(null)}
                className="text-zinc-400 hover:text-zinc-900 text-lg transition-colors p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={aoSalvarEdicaoModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Título
                </label>
                <input
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={tarefaModal.titulo || ""}
                  onChange={(e) =>
                    setTarefaModal({ ...tarefaModal, titulo: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Obra / Projeto
                  </label>
                  <select
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                    value={tarefaModal.projeto || ""}
                    onChange={(e) =>
                      setTarefaModal({
                        ...tarefaModal,
                        projeto: e.target.value,
                      })
                    }
                    required
                  >
                    {projetos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome_projeto || `Projeto #${p.id}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Categoria
                  </label>
                  <input
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    value={tarefaModal.categoria || ""}
                    onChange={(e) =>
                      setTarefaModal({
                        ...tarefaModal,
                        categoria: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Prazo
                  </label>
                  <input
                    type="date"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    value={tarefaModal.prazo || ""}
                    onChange={(e) =>
                      setTarefaModal({ ...tarefaModal, prazo: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Prioridade
                  </label>
                  <select
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                    value={tarefaModal.prioridade || "normal"}
                    onChange={(e) =>
                      setTarefaModal({
                        ...tarefaModal,
                        prioridade: e.target.value,
                      })
                    }
                  >
                    <option value="normal">Normal</option>
                    <option value="urgente">Urgente</option>
                    <option value="revisao">Revisão</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                    value={tarefaModal.status || "WIP"}
                    onChange={(e) =>
                      setTarefaModal({ ...tarefaModal, status: e.target.value })
                    }
                  >
                    <option value="WIP">Trabalho em Curso (WIP)</option>
                    <option value="SHARED">Compartilhado (Shared)</option>
                    <option value="PUBLISHED">Publicado (Published)</option>
                  </select>
                </div>
              </div>

              {/* ENTREGÁVEL DA TAREFA (UPLOAD RÁPIDO) */}
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider">
                    Entregável / Arquivo da Tarefa
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={uploadEntregavelTarefa}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    + Enviar Arquivo para a Obra
                  </button>
                </div>
                <p className="text-xs text-zinc-500 m-0">
                  Arquivos enviados recentemente nesta obra:
                </p>
                <div className="max-h-24 overflow-y-auto space-y-1 pt-1">
                  {arquivos
                    .filter(
                      (a) => String(a.projeto) === String(tarefaModal.projeto),
                    )
                    .map((arq) => {
                      const nomeArq = arq.arquivo
                        ? arq.arquivo.split("/").pop()
                        : "Documento";
                      return (
                        <div
                          key={arq.id}
                          className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-indigo-100 text-xs"
                        >
                          <span className="truncate text-zinc-700 font-medium">
                            {nomeArq}
                          </span>
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
                </div>
              </div>

              {/* CHECKLIST */}
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Itens do Checklist
                  </label>
                  <span className="text-xs text-indigo-600 font-medium">
                    {tarefaModal.subtarefas?.filter((s) => s.concluida)
                      .length || 0}{" "}
                    de {tarefaModal.subtarefas?.length || 0} concluídos
                  </span>
                </div>

                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {tarefaModal.subtarefas &&
                    tarefaModal.subtarefas.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-zinc-200 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={sub.concluida}
                            onChange={() =>
                              aoToggleSubtarefa(sub, tarefaModal.id)
                            }
                            className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer accent-indigo-600 shrink-0"
                          />
                          <span
                            className={`text-sm truncate ${sub.concluida ? "line-through text-zinc-400" : "text-zinc-700"}`}
                          >
                            {sub.titulo}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            aoDeletarSubtarefa(sub.id, tarefaModal.id)
                          }
                          className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded transition-colors shrink-0 ml-2 cursor-pointer"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="Adicionar novo item ao checklist..."
                    value={novaSubtarefaModalText}
                    onChange={(e) => setNovaSubtarefaModalText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (!novaSubtarefaModalText.trim()) return;
                        aoAdicionarSubtarefa(
                          tarefaModal.id,
                          novaSubtarefaModalText,
                        );
                        setNovaSubtarefaModalText("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                    onClick={() => {
                      if (!novaSubtarefaModalText.trim()) return;
                      aoAdicionarSubtarefa(
                        tarefaModal.id,
                        novaSubtarefaModalText,
                      );
                      setNovaSubtarefaModalText("");
                    }}
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTarefaModal(null)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      );
}
