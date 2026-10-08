import { useCallback, useState, useEffect } from "react";
import api from "../api";

export default function useWorkspaceData() {
  const [clientes, setClientes] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [pastas, setPastas] = useState([]);
  const [arquivos, setArquivos] = useState([]);

  const carregarDados = useCallback(async () => {
    try {
      // 1. Leitura síncrona do token no momento do request
      const token =
        localStorage.getItem("access") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("access") ||
        sessionStorage.getItem("token");

      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const clienteId =
        localStorage.getItem("cliente_id") || sessionStorage.getItem("cliente_id");
      const userRole =
        localStorage.getItem("userRole") || sessionStorage.getItem("userRole");

      const params =
        userRole === "cliente" && clienteId ? { cliente_id: clienteId } : {};

      const [resClientes, resProjetos, resTarefas, resPastas, resArquivos] =
        await Promise.all([
          api.get("clientes/", { params, headers }),
          api.get("projetos/", { params, headers }),
          api.get("tarefas/", { params, headers }),
          api.get("pastas/", { params, headers }),
          api.get("arquivos/", { params, headers }),
        ]);

      setClientes(resClientes.data || []);
      setProjetos(resProjetos.data || []);
      setTarefas(resTarefas.data || []);
      setPastas(resPastas.data || []);
      setArquivos(resArquivos.data || []);
    } catch (error) {
      console.error("Erro ao buscar dados da API", error);
    }
  }, []);

  // 2. useEffect de montagem ([]): conserta o F5 vazio do arquiteto
  useEffect(() => {
    const access =
      localStorage.getItem("access") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("access") ||
      sessionStorage.getItem("token");
    const role =
      localStorage.getItem("userRole") || sessionStorage.getItem("userRole");

    if (access && role === "arquiteto") {
      carregarDados();
    }
  }, [carregarDados]);

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
