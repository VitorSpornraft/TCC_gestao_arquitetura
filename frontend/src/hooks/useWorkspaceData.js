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
      const [resClientes, resProjetos, resTarefas, resPastas, resArquivos] =
        await Promise.all([
          api.get("clientes/"),
          api.get("projetos/"),
          api.get("tarefas/"),
          api.get("pastas/"),
          api.get("arquivos/"),
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
