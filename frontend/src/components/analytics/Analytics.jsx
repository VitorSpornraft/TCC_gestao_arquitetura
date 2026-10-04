import { useEffect } from "react";
import MetricsGrid from "./MetricsGrid";
import RecentFilesAudit from "./RecentFilesAudit";
import TaskStatusOverview from "./TaskStatusOverview";

export default function Analytics({
  projetos = [],
  tarefas = [],
  arquivos = [],
  carregarDados,
}) {
  useEffect(() => {
    if (carregarDados) {
      carregarDados();
    }
  }, [carregarDados]);

  const obrasAtivas = projetos.filter((projeto) => !projeto.arquivado);

  const tarefasAtivas = tarefas.filter((tarefa) => {
    const obra = projetos.find(
      (p) => String(p.id) === String(tarefa.projeto?.id || tarefa.projeto),
    );
    return !tarefa.arquivado && (!obra || !obra.arquivado);
  });

  const totalTarefas = tarefasAtivas.length;
  const tarefasConcluidas = tarefasAtivas.filter(
    (tarefa) =>
      (tarefa.status || "").trim().toUpperCase() === "PUBLISHED" ||
      Boolean(tarefa.concluida),
  ).length;

  const statusCounts = {
    WIP: tarefasAtivas.filter(
      (tarefa) => (tarefa.status || "").trim().toUpperCase() === "WIP",
    ).length,
    SHARED: tarefasAtivas.filter(
      (tarefa) => (tarefa.status || "").trim().toUpperCase() === "SHARED",
    ).length,
    PUBLISHED: tarefasAtivas.filter(
      (tarefa) => (tarefa.status || "").trim().toUpperCase() === "PUBLISHED",
    ).length,
  };

  const arquivosRecentes = [...arquivos]
    .sort((a, b) => new Date(b.criado_em || 0) - new Date(a.criado_em || 0))
    .slice(0, 5);

  const metrics = [
    {
      label: "Total de Obras",
      value: obrasAtivas.length,
      description: "Obras ativas no sistema",
      icon: "projetos",
      iconClass: "bg-indigo-50 text-indigo-600",
      badgeClass: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Tarefas Concluídas",
      value: tarefasConcluidas,
      description: `De ${totalTarefas} tarefas ativas`,
      icon: "concluidas",
      iconClass: "bg-emerald-50 text-emerald-600",
      badgeClass: "text-zinc-500 bg-zinc-100",
    },
    {
      label: "Documentos Raiz",
      value: arquivos.filter((arquivo) => !arquivo.versao_de).length,
      description: "Com controle de versão",
      icon: "documentos",
      iconClass: "bg-amber-50 text-amber-600",
      badgeClass: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Eficiência do Fluxo",
      value: `${totalTarefas > 0 ? Math.round((tarefasConcluidas / totalTarefas) * 100) : 0}%`,
      description: "Taxa de entrega",
      icon: "eficiencia",
      iconClass: "bg-indigo-50 text-indigo-600",
      badgeClass: "text-indigo-600 bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-8 font-sans p-2">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight m-0">Analytics</h2>
        </div>
      </header>
      <MetricsGrid metrics={metrics} />
      <TaskStatusOverview totalTarefas={totalTarefas} statusCounts={statusCounts} />
      <RecentFilesAudit arquivos={arquivos} projetos={projetos} arquivosRecentes={arquivosRecentes} />
    </div>
  );
}
