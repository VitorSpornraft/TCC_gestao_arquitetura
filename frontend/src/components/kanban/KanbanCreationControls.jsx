export default function KanbanCreationControls({ busca, setBusca, projetos, filtroObra, setFiltroObra, filtroPrioridade, setFiltroPrioridade, ordenacaoPrazo, setOrdenacaoPrazo, mostrarFormNovaTarefa, setMostrarFormNovaTarefa, handleCriar, templatesTarefas, aplicarTemplate, novaTarefa, setNovaTarefa, mostrarArquivados, setMostrarArquivados, totalArquivados }) {
  return (
    <div className="w-full space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 w-full">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex items-center w-full md:w-72">
            <svg
              className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-900 shadow-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              placeholder="Pesquisar tarefas..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <select
            className="bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-700 shadow-xs outline-none cursor-pointer"
            value={filtroObra}
            onChange={(e) => setFiltroObra(e.target.value)}
          >
            <option value="">Todas as Obras</option>
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome_projeto}
              </option>
            ))}
          </select>

          <select
            className="bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-700 shadow-xs outline-none cursor-pointer"
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value)}
          >
            <option value="">Todas Prioridades</option>
            <option value="urgente">Urgente</option>
            <option value="normal">Normal</option>
            <option value="revisao">Revisão</option>
          </select>

          <select
            className="bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-700 shadow-xs outline-none cursor-pointer"
            value={ordenacaoPrazo}
            onChange={(e) => setOrdenacaoPrazo(e.target.value)}
          >
            <option value="padrao">Ordem Padrão</option>
            <option value="proximos">Prazos Mais Próximos</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setMostrarArquivados(!mostrarArquivados)}
          className={`font-medium text-sm px-4 py-2.5 rounded-xl border shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
            mostrarArquivados
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
          }`}
          title="Exibir tarefas das obras arquivadas"
        >
          Arquivados ({totalArquivados})
        </button>

        <button
          onClick={() => setMostrarFormNovaTarefa(!mostrarFormNovaTarefa)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          {mostrarFormNovaTarefa ? "✕ Fechar" : "+ Nova Tarefa"}
        </button>
      </div>

      {/* FORMULÁRIO COM TEMPLATES DE CHECKLIST */}
      {mostrarFormNovaTarefa && (
        <form
          onSubmit={handleCriar}
          className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm w-full space-y-4 animate-fadeIn"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="text-base font-semibold text-zinc-900 m-0">
              Criar Nova Tarefa
            </h3>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-zinc-400 font-medium mr-1">
                Templates (Checklist Automático):
              </span>
              {templatesTarefas.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => aplicarTemplate(t)}
                  className="text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer border border-indigo-100"
                >
                   {t.categoria}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              className="flex-[2] bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none"
              placeholder="Título da tarefa"
              required
              value={novaTarefa.titulo}
              onChange={(e) =>
                setNovaTarefa({ ...novaTarefa, titulo: e.target.value })
              }
            />
            <select
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm cursor-pointer"
              required
              value={novaTarefa.projeto}
              onChange={(e) =>
                setNovaTarefa({ ...novaTarefa, projeto: e.target.value })
              }
            >
              <option value="">Selecione a Obra...</option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome_projeto}
                </option>
              ))}
            </select>
            <input
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white outline-none"
              placeholder="Categoria"
              required
              value={novaTarefa.categoria}
              onChange={(e) =>
                setNovaTarefa({ ...novaTarefa, categoria: e.target.value })
              }
            />
            <select
              className="w-[130px] bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm cursor-pointer"
              value={novaTarefa.prioridade}
              onChange={(e) =>
                setNovaTarefa({ ...novaTarefa, prioridade: e.target.value })
              }
            >
              <option value="normal">Normal</option>
              <option value="urgente">Urgente</option>
              <option value="revisao">Revisão</option>
            </select>
            <input
              type="date"
              className="w-[150px] bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm outline-none"
              required
              value={novaTarefa.prazo}
              onChange={(e) =>
                setNovaTarefa({ ...novaTarefa, prazo: e.target.value })
              }
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm cursor-pointer"
            >
              Salvar
            </button>
          </div>
          {novaTarefa.checklistTemplate?.length > 0 && (
            <div className="text-xs text-indigo-700 bg-indigo-50 p-2.5 rounded-xl font-medium">
              ✓ Template carregado com {novaTarefa.checklistTemplate.length}{" "}
              itens de checklist predefinidos.
            </div>
          )}
        </form>
      )}
    </div>
  );
}
