import { useState, useEffect } from 'react';
import api from './api';
import './App.css';

import Navbar from './components/Navbar';
import Kanban from './components/Kanban';
import ClientList from './components/ClientList';
import ClientExplorer from './components/ClientExplorer';

export default function App() {
  const [telaAtual, setTelaAtual] = useState('kanban');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const [tarefas, setTarefas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pastas, setPastas] = useState([]);
  const [busca, setBusca] = useState('');
  const [tarefaModal, setTarefaModal] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const resTarefas = await api.get('tarefas/');
      const resClientes = await api.get('clientes/');
      const resPastas = await api.get('pastas/');
      setTarefas(resTarefas.data);
      setClientes(resClientes.data);
      setPastas(resPastas.data);
    } catch (error) {
      console.error("Erro ao puxar dados:", error);
    }
  };

  const criarTarefa = async (dadosNovaTarefa) => {
    try {
      await api.post('tarefas/', dadosNovaTarefa);
      carregarDados();
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
    }
  };

  const salvarEdicaoModal = async (e) => {
    e.preventDefault();
    if (!tarefaModal) return;
    try {
      await api.put(`tarefas/${tarefaModal.id}/`, {
        titulo: tarefaModal.titulo,
        cliente: tarefaModal.cliente,
        categoria: tarefaModal.categoria,
        prazo: tarefaModal.prazo,
        status: tarefaModal.status
      });
      setTarefaModal(null);
      carregarDados();
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
    }
  };

  const deletarTarefa = async (tarefaId) => {
    if (window.confirm("Tem certeza que deseja excluir esta tarefa?")) {
      try {
        await api.delete(`tarefas/${tarefaId}/`);
        carregarDados();
      } catch (error) {
        console.error("Erro ao deletar tarefa:", error);
      }
    }
  };

  const criarCliente = async (dadosNovoCliente) => {
    try {
      await api.post('clientes/', dadosNovoCliente);
      carregarDados();
      alert("Cliente cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
    }
  };

  const adicionarSubtarefa = async (tarefaId, texto) => {
    if (!texto) return;
    try {
      await api.post('subtarefas/', { tarefa: tarefaId, titulo: texto, concluida: false });
      carregarDados();
      if (tarefaModal && tarefaModal.id === tarefaId) {
        const res = await api.get(`tarefas/${tarefaId}/`);
        setTarefaModal(res.data);
      }
    } catch (error) {
      console.error("Erro ao adicionar subtarefa:", error);
    }
  };

  const toggleSubtarefa = async (sub, tarefaIdParaAtualizarModal = null) => {
    try {
      await api.patch(`subtarefas/${sub.id}/`, { concluida: !sub.concluida });
      carregarDados();
      if (tarefaIdParaAtualizarModal) {
        const res = await api.get(`tarefas/${tarefaIdParaAtualizarModal}/`);
        setTarefaModal(res.data);
      }
    } catch (error) {
      console.error("Erro ao atualizar subtarefa:", error);
    }
  };

  const deletarSubtarefa = async (subId, tarefaIdParaAtualizarModal) => {
    try {
      await api.delete(`subtarefas/${subId}/`);
      carregarDados();
      const res = await api.get(`tarefas/${tarefaIdParaAtualizarModal}/`);
      setTarefaModal(res.data);
    } catch (error) {
      console.error("Erro ao deletar subtarefa:", error);
    }
  };

  const moverTarefa = async (tarefaId, novoStatus) => {
    try {
      await api.patch(`tarefas/${tarefaId}/`, { status: novoStatus });
      carregarDados();
    } catch (error) {
      console.error("Erro ao mover tarefa:", error);
    }
  };

  return (
    <div className="app-container">
      <Navbar 
        telaAtual={telaAtual} 
        setTelaAtual={setTelaAtual} 
        setClienteSelecionado={setClienteSelecionado} 
      />

      {telaAtual === 'kanban' && (
        <Kanban 
          tarefas={tarefas}
          clientes={clientes}
          busca={busca}
          setBusca={setBusca}
          aoCriarTarefa={criarTarefa}
          aoDeletarTarefa={deletarTarefa}
          aoMoverTarefa={moverTarefa}
          aoAdicionarSubtarefa={adicionarSubtarefa}
          aoToggleSubtarefa={toggleSubtarefa}
          aoDeletarSubtarefa={deletarSubtarefa}
          tarefaModal={tarefaModal}
          setTarefaModal={setTarefaModal}
          aoSalvarEdicaoModal={salvarEdicaoModal}
        />
      )}

      {telaAtual === 'clientes' && (
        <ClientList 
          clientes={clientes}
          aoCriarCliente={criarCliente}
          aoSelecionarCliente={(cliente) => {
            setClienteSelecionado(cliente);
            setTelaAtual('explorador');
          }}
        />
      )}

      {telaAtual === 'explorador' && clienteSelecionado && (
        <ClientExplorer 
          clienteSelecionado={clienteSelecionado}
          pastas={pastas}
          aoVoltar={() => setTelaAtual('clientes')}
        />
      )}
    </div>
  );
}