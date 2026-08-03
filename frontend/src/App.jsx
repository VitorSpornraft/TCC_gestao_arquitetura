import { useState, useEffect } from 'react';
import api from './api';
import './App.css';

import Navbar from './components/Navbar';
import Kanban from './components/Kanban';
import ClientList from './components/ClientList';
import ClientExplorer from './components/ClientExplorer';

export default function App() {
  const [telaAtual, setTelaAtual] = useState('kanban');
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);

  const [tarefas, setTarefas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [projetos, setProjetos] = useState([]);
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
      const resProjetos = await api.get('projetos/'); 
      const resPastas = await api.get('pastas/');
      
      setTarefas(resTarefas.data);
      setClientes(resClientes.data);
      setProjetos(resProjetos.data);
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
        projeto: tarefaModal.projeto, 
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
  
  // Função para criar o cliente isolado e retornar os dados (usada no Modal)
  const criarCliente = async (dadosNovoCliente) => {
    try {
      const res = await api.post('clientes/', dadosNovoCliente);
      carregarDados();
      return res.data; // Retorna o cliente criado para o Modal vincular ao projeto
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
    }
  };

  const criarProjeto = async (dadosNovoProjeto) => {
    try {
      await api.post('projetos/', dadosNovoProjeto);
      carregarDados();
      alert("Projeto cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar projeto:", error);
    }
  };

  const editarProjeto = async (projetoId, dados) => {
    try {
      await api.put(`projetos/${projetoId}/`, dados);
      carregarDados();
    } catch (error) {
      console.error("Erro ao editar projeto:", error);
      alert("Erro ao editar projeto.");
    }
  };

  const arquivarProjeto = async (projetoId, statusAtual) => {
    if (window.confirm("Deseja arquivar este projeto? Ele sairá da tela principal.")) {
      try {
        await api.patch(`projetos/${projetoId}/`, { arquivado: !statusAtual });
        carregarDados();
      } catch (error) {
        console.error("Erro ao arquivar projeto:", error);
      }
    }
  };

  // --- SUBTAREFAS ---
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
        setProjetoSelecionado={setProjetoSelecionado} 
      />

      {telaAtual === 'kanban' && (
        <Kanban 
          tarefas={tarefas}
          projetos={projetos} 
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
          projetos={projetos} 
          clientes={clientes} 
          tarefas={tarefas}
          aoCriarProjeto={criarProjeto} 
          aoCriarCliente={criarCliente}
          aoEditarProjeto={editarProjeto}
          aoArquivarProjeto={arquivarProjeto}
          aoSelecionarProjeto={(projeto) => {
            setProjetoSelecionado(projeto);
            setTelaAtual('explorador');
          }}
        />
      )}

      {telaAtual === 'explorador' && projetoSelecionado && (
        <ClientExplorer 
          projetoSelecionado={projetoSelecionado}
          pastas={pastas}
          aoVoltar={() => setTelaAtual('clientes')}
        />
      )}
    </div>
  );
}