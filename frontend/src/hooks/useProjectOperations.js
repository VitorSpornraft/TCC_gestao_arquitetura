import axios from "axios";
import { API_BASE_URL } from "../api";

export default function useProjectOperations({
  clientes,
  setClientes,
  projetos,
  setProjetos,
  tarefas,
  setTarefas,
  carregarDados,
  aoFecharModalObra,
  setConfirmacao,
}) {
  const aoCriarClienteNovo = async (dadosCliente) => {
    try {
      const codigoGerado = Math.random().toString(36).substring(2, 8).toUpperCase();
      const dadosComCodigo = { ...dadosCliente, codigo_acesso: codigoGerado };

      const res = await axios.post(`${API_BASE_URL}/clientes/`, dadosComCodigo);
      setClientes([...clientes, res.data]);
      return res.data;
    } catch (error) {
      console.error("Erro ao criar novo cliente:", error);
      return null;
    }
  };

  const aoSalvarProjeto = async (dadosProjeto) => {
    try {
      if (dadosProjeto.id) {
        await axios.put(
          `${API_BASE_URL}/projetos/${dadosProjeto.id}/`,
          dadosProjeto,
        );
      } else {
        await axios.post(`${API_BASE_URL}/projetos/`, dadosProjeto);
      }
      carregarDados();
      if (aoFecharModalObra) aoFecharModalObra();
    } catch (error) {
      console.error("Erro ao salvar a obra:", error);
      alert("Ocorreu um erro ao salvar a obra.");
    }
  };

  const aoDeletarProjeto = (id, nome) => {
    const projeto = projetos.find((p) => p.id === id);
    if (!projeto) return;

    if (!projeto.arquivado) {
      setConfirmacao({
        titulo: "Arquivar obra",
        mensagem: `Deseja enviar a obra "${nome}" para os Arquivados?`,
        textoConfirmar: "Arquivar",
        variante: "aviso",
        aoConfirmar: async () => {
          try {
            const res = await axios.patch(
              `${API_BASE_URL}/projetos/${id}/`,
              { arquivado: true },
            );
            setProjetos(projetos.map((p) => (p.id === id ? res.data : p)));
          } catch (error) {
            console.error("Erro ao arquivar obra:", error);
          }
        },
      });
    } else {
      setConfirmacao({
        titulo: "Excluir obra permanentemente",
        mensagem: `A obra "${nome}" e seus dados vinculados serão excluídos permanentemente. Deseja continuar?`,
        textoConfirmar: "Excluir definitivamente",
        variante: "perigo",
        aoConfirmar: async () => {
          try {
            await axios.delete(`${API_BASE_URL}/projetos/${id}/`);
            setProjetos(projetos.filter((p) => p.id !== id));
            setTarefas(tarefas.filter((t) => t.projeto !== id));
          } catch (error) {
            console.error("Erro ao deletar obra:", error);
          }
        },
      });
    }
  };

  const aoRestaurarProjeto = (id, nome) => {
    setConfirmacao({
      titulo: "Restaurar obra",
      mensagem: `Deseja restaurar a obra "${nome}" para os projetos ativos?`,
      textoConfirmar: "Restaurar",
      variante: "padrao",
      aoConfirmar: async () => {
        try {
          const res = await axios.patch(
            `${API_BASE_URL}/projetos/${id}/`,
            { arquivado: false },
          );
          setProjetos(projetos.map((p) => (p.id === id ? res.data : p)));
        } catch (error) {
          console.error("Erro ao restaurar obra:", error);
        }
      },
    });
  };

  const aoDeletarCliente = (id, nome) => {
    setConfirmacao({
      titulo: "Excluir Cliente",
      mensagem: `Deseja realmente excluir o cliente "${nome}"?`,
      textoConfirmar: "Excluir",
      variante: "aviso",
      aoConfirmar: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/clientes/${id}/`);
          setClientes(
            clientes.map((c) => (c.id === id ? { ...c, deletado: true } : c)),
          );
        } catch (error) {
          console.error("Erro ao excluir cliente:", error);
          alert("Ocorreu um erro ao excluir o cliente.");
        }
      },
    });
  };

  const aoEditarCliente = async (id, dadosCliente) => {
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/clientes/${id}/`,
        dadosCliente,
      );
      setClientes(clientes.map((c) => (c.id === id ? res.data : c)));
      return res.data;
    } catch (error) {
      console.error("Erro ao editar cliente:", error);
      alert("Ocorreu um erro ao atualizar os dados do cliente.");
      return null;
    }
  };

  const aoRestaurarCliente = (id, nome) => {
    setConfirmacao({
      titulo: "Restaurar Cliente",
      mensagem: `Deseja restaurar o cliente "${nome}" para a lista de clientes ativos?`,
      textoConfirmar: "Restaurar",
      variante: "padrao",
      aoConfirmar: async () => {
        try {
          const res = await axios.patch(`${API_BASE_URL}/clientes/${id}/`, {
            deletado: false,
          });
          setClientes(clientes.map((c) => (c.id === id ? res.data : c)));
        } catch (error) {
          console.error("Erro ao restaurar cliente:", error);
          alert("Ocorreu um erro ao restaurar o cliente.");
        }
      },
    });
  };

  return {
    aoCriarClienteNovo,
    aoSalvarProjeto,
    aoDeletarProjeto,
    aoRestaurarProjeto,
    aoDeletarCliente,
    aoEditarCliente,
    aoRestaurarCliente,
  };
}
