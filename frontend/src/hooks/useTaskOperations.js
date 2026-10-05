import api from "../api";

export default function useTaskOperations({
  tarefas,
  setTarefas,
  tarefaModal,
  setTarefaModal,
}) {
  const aoCriarTarefa = async (dadosTarefa) => {
    try {
      const { checklistTemplate, ...dadosParaEnviar } = dadosTarefa;
      const res = await api.post("tarefas/", dadosParaEnviar);
      const novaTarefaCriada = res.data;

      if (checklistTemplate && checklistTemplate.length > 0) {
        const novasSubtarefas = [];
        for (const item of checklistTemplate) {
          const subRes = await api.post("subtarefas/", {
            titulo: item,
            concluida: false,
            tarefa: novaTarefaCriada.id,
          });
          novasSubtarefas.push(subRes.data);
        }
        novaTarefaCriada.subtarefas = novasSubtarefas;
      }

      setTarefas([...tarefas, novaTarefaCriada]);
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
    }
  };

  const aoDeletarTarefa = async (id) => {
    const tarefa = tarefas.find((item) => item.id === id);
    if (!tarefa) return;

    try {
      const res = await api.patch(`tarefas/${id}/`, { arquivado: true });
      setTarefas(
        tarefas.map((item) =>
          item.id === id ? { ...item, ...res.data } : item,
        ),
      );
    } catch (error) {
      console.error("Erro ao arquivar tarefa:", error);
    }
  };

  const aoRestaurarTarefa = async (id) => {
    try {
      const res = await api.patch(`tarefas/${id}/`, { arquivado: false });
      setTarefas(
        tarefas.map((item) =>
          item.id === id ? { ...item, ...res.data } : item,
        ),
      );
    } catch (error) {
      console.error("Erro ao restaurar tarefa:", error);
    }
  };

  const aoExcluirTarefaPermanentemente = async (id) => {
    try {
      await api.delete(`tarefas/${id}/`);
      setTarefas(tarefas.filter((item) => item.id !== id));
      if (tarefaModal?.id === id) setTarefaModal(null);
    } catch (error) {
      console.error("Erro ao excluir tarefa permanentemente:", error);
    }
  };

  const aoMoverTarefa = async (tarefaId, novoStatus) => {
    const tarefa = tarefas.find((t) => t.id === parseInt(tarefaId));
    if (!tarefa || tarefa.status === novoStatus) return;
    try {
      const res = await api.put(`tarefas/${tarefaId}/`, {
        ...tarefa,
        status: novoStatus,
      });
      setTarefas(
        tarefas.map((t) => (t.id === parseInt(tarefaId) ? res.data : t)),
      );
    } catch (error) {
      console.error("Erro ao mover tarefa:", error);
    }
  };

  const aoAdicionarSubtarefa = async (tarefaId, titulo) => {
    if (!titulo || !titulo.trim()) return;
    try {
      const novaSub = {
        titulo: titulo.trim(),
        concluida: false,
        tarefa: tarefaId,
      };
      const res = await api.post("subtarefas/", novaSub);

      const novasTarefas = tarefas.map((t) => {
        if (t.id === tarefaId) {
          const subsAtuais = t.subtarefas || [];
          return { ...t, subtarefas: [...subsAtuais, res.data] };
        }
        return t;
      });
      setTarefas(novasTarefas);

      if (tarefaModal && tarefaModal.id === tarefaId) {
        setTarefaModal(novasTarefas.find((t) => t.id === tarefaId));
      }
    } catch (error) {
      console.error("Erro ao adicionar subtarefa", error);
    }
  };

  const aoToggleSubtarefa = async (sub, tarefaId = null) => {
    try {
      const res = await api.put(`subtarefas/${sub.id}/`, {
        ...sub,
        concluida: !sub.concluida,
      });

      const tId = tarefaId || sub.tarefa;
      const novasTarefas = tarefas.map((t) => {
        if (t.id === tId) {
          return {
            ...t,
            subtarefas: t.subtarefas.map((s) =>
              s.id === sub.id ? res.data : s,
            ),
          };
        }
        return t;
      });
      setTarefas(novasTarefas);

      if (tarefaModal && tarefaModal.id === tId) {
        setTarefaModal(novasTarefas.find((t) => t.id === tId));
      }
    } catch (error) {
      console.error("Erro ao alterar subtarefa", error);
    }
  };

  const aoDeletarSubtarefa = async (subId, tarefaId) => {
    try {
      await api.delete(`subtarefas/${subId}/`);
      const novasTarefas = tarefas.map((t) => {
        if (t.id === tarefaId) {
          return {
            ...t,
            subtarefas: t.subtarefas.filter((s) => s.id !== subId),
          };
        }
        return t;
      });
      setTarefas(novasTarefas);

      if (tarefaModal && tarefaModal.id === tarefaId) {
        setTarefaModal(novasTarefas.find((t) => t.id === tarefaId));
      }
    } catch (error) {
      console.error("Erro ao excluir subtarefa", error);
    }
  };

  const aoSalvarEdicaoModal = async (e) => {
    e.preventDefault();
    if (!tarefaModal) return;
    try {
      const dadosAtualizados = {
        titulo: tarefaModal.titulo,
        categoria: tarefaModal.categoria,
        prazo: tarefaModal.prazo,
        prioridade: tarefaModal.prioridade || "normal",
        status: tarefaModal.status,
        projeto:
          typeof tarefaModal.projeto === "object"
            ? tarefaModal.projeto.id
            : tarefaModal.projeto,
      };

      const res = await api.put(
        `tarefas/${tarefaModal.id}/`,
        dadosAtualizados,
      );

      setTarefas(
        tarefas.map((t) =>
          t.id === res.data.id ? { ...res.data, subtarefas: t.subtarefas } : t,
        ),
      );
      setTarefaModal(null);
    } catch (error) {
      console.error(
        "Erro ao salvar edição da tarefa:",
        error.response?.data || error,
      );
      alert("Ocorreu um erro ao salvar a tarefa. Verifique o console.");
    }
  };

  return {
    aoCriarTarefa,
    aoDeletarTarefa,
    aoRestaurarTarefa,
    aoExcluirTarefaPermanentemente,
    aoMoverTarefa,
    aoAdicionarSubtarefa,
    aoToggleSubtarefa,
    aoDeletarSubtarefa,
    aoSalvarEdicaoModal,
  };
}
