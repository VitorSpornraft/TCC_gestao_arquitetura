import { useCallback, useState } from "react";
import api from "../api";

export default function useWorkspaceData() {
  const [clientes, setClientes] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [pastas, setPastas] = useState([]);
  const [arquivos, setArquivos] = useState([]);

  const carregarDados = useCallback(async () => {
    try {
      const clienteId = localStorage.getItem("cliente_id") || sessionStorage.getItem("cliente_id");
      const userRole = localStorage.getItem("userRole") || sessionStorage.getItem("userRole");

      const params = (userRole === "cliente" && clienteId) ? { cliente_id: clienteId } : {};

      const [resClientes, resProjetos, resTarefas, resPastas, resArquivos] =
        await Promise.all([
          api.get("clientes/", { params }),
          api.get("projetos/", { params }),
          api.get("tarefas/", { params }),
          api.get("pastas/", { params }),
          api.get("arquivos/", { params }),
        ]);
      setClientes(resClientes.data);
      setProjetos(resProjetos.data);
      setTarefas(resTarefas.data);
      setPastas(resPastas.data);
      setArquivos(resArquivos.data);
    } catch (error) {
      console.error("Erro ao buscar dados da API", error);
    }
  }, []);

  return {
    clientes,
    setClientes,
    projetos,
    setProjetos,
    tarefas,
    setTarefas,
    pastas,
    setPastas,
    arquivos,
    setArquivos,
    carregarDados,
  };
}
