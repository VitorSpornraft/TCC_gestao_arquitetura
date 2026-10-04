import { useState } from "react";
import KanbanBoard from "./KanbanBoard";
import KanbanCreationControls from "./KanbanCreationControls";
import HistoricoModal from "./HistoricoModal";
import TaskEditModal from "./TaskEditModal";
import ConfirmActionModal from "../modals/ConfirmActionModal";
import { createEmptyTask, TASK_TEMPLATES } from "./taskTemplates";

export default function Kanban({
  tarefas,
  projetos,
  clientes,
  arquivos = [],
  busca,
  setBusca,
  aoCriarTarefa,
  aoDeletarTarefa,
  aoRestaurarTarefa,
  aoExcluirTarefaPermanentemente,
  aoMoverTarefa,
  aoAdicionarSubtarefa,
  aoToggleSubtarefa,
  aoDeletarSubtarefa,
  tarefaModal,
  setTarefaModal,
  aoSalvarEdicaoModal,
}) {
  const [novaTarefa, setNovaTarefa] = useState(createEmptyTask);

  const [mostrarFormNovaTarefa, setMostrarFormNovaTarefa] = useState(false);
  const [novaSubtarefaText, setNovaSubtarefaText] = useState({});
  const [novaSubtarefaModalText, setNovaSubtarefaModalText] = useState("");
  const [colunaSobreArrasto, setColunaSobreArrasto] = useState(null);
  const [cardArrastando, setCardArrastando] = useState(null);

  const [arquivoHistoricoId, setArquivoHistoricoId] = useState(null);
  const [arquivoHistoricoNome, setArquivoHistoricoNome] = useState('');
  const [confirmacao, setConfirmacao] = useState(null);

  // FILTROS E ORDENAÇÃO
  const [filtroObra, setFiltroObra] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const [ordenacaoPrazo, setOrdenacaoPrazo] = useState("padrao");
  const [mostrarArquivados, setMostrarArquivados] = useState(false);

  const aplicarTemplate = (template) => {
    setNovaTarefa((prev) => ({
      ...prev,
      titulo: template.titulo,
      categoria: template.categoria,
      prioridade: template.prioridade,
      checklistTemplate: template.checklist,
    }));
  };

  const handleCriar = (e) => {
    e.preventDefault();
    aoCriarTarefa(novaTarefa);
    setNovaTarefa(createEmptyTask());
    setMostrarFormNovaTarefa(false);
  };

  const duplicarTarefa = (t, e) => {
    e.stopPropagation();
    const tarefaDuplicada = {
      titulo: `${t.titulo} (Cópia)`,
      projeto: typeof t.projeto === "object" ? t.projeto.id : t.projeto,
      categoria: t.categoria || "Geral",
      prazo: t.prazo || "",
      prioridade: t.prioridade || "normal",
      status: t.status || "WIP",
    };
    aoCriarTarefa(tarefaDuplicada);
  };

  const confirmarDelecao = (tarefa) => {
    if (tarefa.arquivado) {
      setConfirmacao({
        titulo: "Excluir tarefa permanentemente",
        mensagem: "Esta ação não poderá ser desfeita. Deseja continuar?",
        textoConfirmar: "Excluir definitivamente",
        variante: "perigo",
        aoConfirmar: () => aoExcluirTarefaPermanentemente(tarefa.id),
      });
      return;
    }

    setConfirmacao({
      titulo: "Arquivar tarefa",
      mensagem: "Deseja mover esta tarefa para os Arquivados?",
      textoConfirmar: "Arquivar",
      variante: "aviso",
      aoConfirmar: () => aoDeletarTarefa(tarefa.id),
    });
  };

  const dataHoje = "2026-08-24";
  const isAtrasado = (prazo, status) => {
    if (!prazo || status === "REALIZADO") return false;
    return prazo < dataHoje;
  };

  const tarefasFiltradas = tarefas.filter((t) => {
    const termoBusca = (busca || "").toLowerCase();
    const tituloSeguro = (t.titulo || "").toLowerCase();
    const categoriaSegura = (t.categoria || "").toLowerCase();

    const matchTitulo = tituloSeguro.includes(termoBusca);
    const matchCategoria = categoriaSegura.includes(termoBusca);

    const projetoObj = projetos.find((p) => p.id === t.projeto);
    const estaArquivada = Boolean(t.arquivado || projetoObj?.arquivado);
    const matchProjeto = projetoObj
      ? (projetoObj.nome_projeto || "").toLowerCase().includes(termoBusca)
      : false;

    const clienteObj = projetoObj
      ? clientes.find((c) => c.id === projetoObj.cliente)
      : null;
    const matchCliente = clienteObj
      ? (clienteObj.nome || "").toLowerCase().includes(termoBusca)
      : false;

    const matchFiltroObra = filtroObra
      ? String(t.projeto) === String(filtroObra)
      : true;
    const matchFiltroPrioridade = filtroPrioridade
      ? (t.prioridade || "normal").toLowerCase() === filtroPrioridade
      : true;

    return (
      (matchTitulo || matchCategoria || matchProjeto || matchCliente) &&
      matchFiltroObra &&
      matchFiltroPrioridade &&
      (mostrarArquivados ? estaArquivada : !estaArquivada)
    );
  });

  const ordenarLista = (lista) => {
    if (ordenacaoPrazo === "proximos") {
      return [...lista].sort((a, b) => {
        const prazoA = a.prazo ? new Date(`${String(a.prazo).slice(0, 10)}T00:00:00`).getTime() : Infinity;
        const prazoB = b.prazo ? new Date(`${String(b.prazo).slice(0, 10)}T00:00:00`).getTime() : Infinity;
        return prazoA - prazoB;
      });
    }
    return lista;
  };

  const colunasConfig = [
    {
      titulo: "Trabalho em Curso (WIP)",
      statusKey: "WIP",
      lista: ordenarLista(
        tarefasFiltradas.filter(
          (t) => (t.status || "").toUpperCase() === "WIP",
        ),
      ),
      estiloColuna: "bg-zinc-100/80 border-zinc-200/90",
      estiloBadge: "bg-zinc-200 text-zinc-700",
    },
    {
      titulo: "Compartilhado (Shared)",
      statusKey: "SHARED",
      lista: ordenarLista(
        tarefasFiltradas.filter(
          (t) => (t.status || "").toUpperCase() === "SHARED",
        ),
      ),
      estiloColuna: "bg-indigo-50/60 border-indigo-100",
      estiloBadge: "bg-indigo-100 text-indigo-700",
    },
    {
      titulo: "Publicado (Published)",
      statusKey: "PUBLISHED",
      lista: ordenarLista(
        tarefasFiltradas.filter(
          (t) => (t.status || "").toUpperCase() === "PUBLISHED",
        ),
      ),
      estiloColuna: "bg-emerald-50/60 border-emerald-100",
      estiloBadge: "bg-emerald-100 text-emerald-700",
    },
  ];

  const badgePrioridade = (prioridade) => {
    switch (prioridade) {
      case "urgente":
        return (
          <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-semibold">
            Urgente
          </span>
        );
      case "revisao":
        return (
          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md font-semibold">
            Revisão
          </span>
        );
      default:
        return (
          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-semibold">
            Normal
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight m-0">
            Quadro Kanban
          </h2>
        </div>
      </header>

      <KanbanCreationControls
        busca={busca}
        setBusca={setBusca}
        projetos={projetos}
        filtroObra={filtroObra}
        setFiltroObra={setFiltroObra}
        filtroPrioridade={filtroPrioridade}
        setFiltroPrioridade={setFiltroPrioridade}
        ordenacaoPrazo={ordenacaoPrazo}
        setOrdenacaoPrazo={setOrdenacaoPrazo}
        mostrarFormNovaTarefa={mostrarFormNovaTarefa}
        setMostrarFormNovaTarefa={setMostrarFormNovaTarefa}
        handleCriar={handleCriar}
        templatesTarefas={TASK_TEMPLATES}
        aplicarTemplate={aplicarTemplate}
        novaTarefa={novaTarefa}
        setNovaTarefa={setNovaTarefa}
        mostrarArquivados={mostrarArquivados}
        setMostrarArquivados={setMostrarArquivados}
        totalArquivados={tarefas.filter((tarefa) => {
          const projeto = projetos.find((item) => item.id === tarefa.projeto);
          return tarefa.arquivado || projeto?.arquivado;
        }).length}
      />
      <KanbanBoard
        colunasConfig={colunasConfig}
        colunaSobreArrasto={colunaSobreArrasto}
        setColunaSobreArrasto={setColunaSobreArrasto}
        aoMoverTarefa={aoMoverTarefa}
        projetos={projetos}
        clientes={clientes}
        arquivos={arquivos}
        isAtrasado={isAtrasado}
        cardArrastando={cardArrastando}
        setCardArrastando={setCardArrastando}
        setTarefaModal={setTarefaModal}
        duplicarTarefa={duplicarTarefa}
        confirmarDelecao={confirmarDelecao}
        aoRestaurarTarefa={aoRestaurarTarefa}
        badgePrioridade={badgePrioridade}
        aoToggleSubtarefa={aoToggleSubtarefa}
        novaSubtarefaText={novaSubtarefaText}
        setNovaSubtarefaText={setNovaSubtarefaText}
        aoAdicionarSubtarefa={aoAdicionarSubtarefa}
      />
      <TaskEditModal
        tarefaModal={tarefaModal}
        setTarefaModal={setTarefaModal}
        aoSalvarEdicaoModal={aoSalvarEdicaoModal}
        projetos={projetos}
        arquivos={arquivos}
        aoAbrirHistorico={(arquivo) => {
          setArquivoHistoricoId(arquivo.id);
          setArquivoHistoricoNome(
            arquivo.arquivo ? arquivo.arquivo.split("/").pop() : "Documento",
          );
        }}
        aoToggleSubtarefa={aoToggleSubtarefa}
        aoDeletarSubtarefa={aoDeletarSubtarefa}
        novaSubtarefaModalText={novaSubtarefaModalText}
        setNovaSubtarefaModalText={setNovaSubtarefaModalText}
        aoAdicionarSubtarefa={aoAdicionarSubtarefa}
      />
      {arquivoHistoricoId && (
        <HistoricoModal
          arquivoId={arquivoHistoricoId}
          arquivoNome={arquivoHistoricoNome}
          listaArquivos={arquivos}
          onClose={() => {
            setArquivoHistoricoId(null);
            setArquivoHistoricoNome("");
          }}
        />
      )}
      {confirmacao && (
        <ConfirmActionModal
          titulo={confirmacao.titulo}
          mensagem={confirmacao.mensagem}
          textoConfirmar={confirmacao.textoConfirmar}
          variante={confirmacao.variante}
          onFechar={() => setConfirmacao(null)}
          onConfirmar={() => {
            confirmacao.aoConfirmar();
            setConfirmacao(null);
          }}
        />
      )}
    </div>
  );
}
