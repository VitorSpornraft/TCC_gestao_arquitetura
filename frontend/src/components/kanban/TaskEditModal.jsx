import TaskDocumentsSection from "./TaskDocumentsSection";
import TaskChecklistSection from "./TaskChecklistSection";

export default function TaskEditModal({
  tarefaModal,
  setTarefaModal,
  aoSalvarEdicaoModal,
  projetos,
  arquivos,
  aoAbrirHistorico,
  aoToggleSubtarefa,
  aoDeletarSubtarefa,
  novaSubtarefaModalText,
  setNovaSubtarefaModalText,
  aoAdicionarSubtarefa,
}) {
  if (!tarefaModal) return null;

  return (
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

          {/* LISTAGEM DE DOCUMENTOS DA OBRA */}
          <TaskDocumentsSection
            arquivos={arquivos}
            tarefaProjetoId={tarefaModal.projeto}
            aoAbrirHistorico={aoAbrirHistorico}
          />

          {/* CHECKLIST */}
          <TaskChecklistSection
            tarefaModal={tarefaModal}
            aoToggleSubtarefa={aoToggleSubtarefa}
            aoDeletarSubtarefa={aoDeletarSubtarefa}
            novaSubtarefaModalText={novaSubtarefaModalText}
            setNovaSubtarefaModalText={setNovaSubtarefaModalText}
            aoAdicionarSubtarefa={aoAdicionarSubtarefa}
          />

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