import { useState, useEffect } from 'react';
import ClientList from "./components/ClientList";
import ClientExplorer from './components/ClientExplorer';
import Kanban from './components/Kanban';
import ClientFormModal from './components/ClientFormModal';
import axios from 'axios';
import './App.css';

export default function App() {
  const [clientes, setClientes] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [pastas, setPastas] = useState([]);
  const [arquivos, setArquivos] = useState([]);
  
  const [abaAtiva, setAbaAtiva] = useState('kanban');
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);
  const [busca, setBusca] = useState('');
  
  // Estados para controle do Modal de Obras
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [projetoParaEditar, setProjetoParaEditar] = useState(null); // <- Novo estado para edição
  
  const [tarefaModal, setTarefaModal] = useState(null);

  // === CARREGAMENTO INICIAL DOS DADOS DA API ===
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [resClientes, resProjetos, resTarefas, resPastas, resArquivos] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/clientes/'),
        axios.get('http://127.0.0.1:8000/api/projetos/'),
        axios.get('http://127.0.0.1:8000/api/tarefas/'),
        axios.get('http://127.0.0.1:8000/api/pastas/'),
        axios.get('http://127.0.0.1:8000/api/arquivos/')
      ]);
      setClientes(resClientes.data);
      setProjetos(resProjetos.data);
      setTarefas(resTarefas.data);
      setPastas(resPastas.data);
      setArquivos(resArquivos.data);
    } catch (error) {
      console.error("Erro ao buscar dados da API", error);
    }
  };

  // === FUNÇÕES DO MODAL AVANÇADO DE OBRAS/CLIENTES ===
  
  const abrirModalNovaObra = () => {
    setProjetoParaEditar(null);
    setIsClientModalOpen(true);
  };

  const abrirModalEdicaoObra = (projeto) => {
    setProjetoParaEditar(projeto);
    setIsClientModalOpen(true);
  };

  const aoFecharModalObra = () => {
    setIsClientModalOpen(false);
    setProjetoParaEditar(null);
  };

  const aoCriarClienteNovo = async (dadosCliente) => {
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/clientes/', dadosCliente);
      setClientes([...clientes, res.data]); 
      return res.data; // Retorna o cliente novo para o modal vincular à obra
    } catch (error) {
      console.error("Erro ao criar novo cliente:", error);
      return null;
    }
  };

  const aoSalvarProjeto = async (dadosProjeto) => {
    try {
      if (dadosProjeto.id) {
        // Se tem ID, é Edição
        await axios.put(`http://127.0.0.1:8000/api/projetos/${dadosProjeto.id}/`, dadosProjeto);
      } else {
        // Se não tem ID, é Criação Nova
        await axios.post('http://127.0.0.1:8000/api/projetos/', dadosProjeto);
      }
      
      carregarDados(); // Atualiza a tela com os dados do banco
      aoFecharModalObra(); // Fecha o modal
    } catch (error) {
      console.error("Erro ao salvar a obra:", error);
      alert("Ocorreu um erro ao salvar a obra. Verifique se o servidor está rodando e se os dados estão corretos.");
    }
  };


  // === FUNÇÕES DE MANIPULAÇÃO DE OBRAS/PROJETOS ===
  const aoDeletarProjeto = async (id, nome) => {
    const projeto = projetos.find(p => p.id === id);

    if (!projeto.arquivado) {
      const confirmar = window.confirm(`Deseja enviar a obra "${nome}" para os Arquivados?`);
      if (!confirmar) return;

      try {
        const res = await axios.patch(`http://127.0.0.1:8000/api/projetos/${id}/`, { arquivado: true });
        setProjetos(projetos.map(p => p.id === id ? res.data : p));
      } catch (error) {
        console.error("Erro ao arquivar obra:", error);
        alert("Erro ao arquivar a obra. Verifique se a API suporta o método PATCH.");
      }
    } else {
      const confirmar = window.confirm(`CUIDADO: Tem certeza que deseja excluir DEFINITIVAMENTE a obra "${nome}"? Esta ação não tem volta.`);
      if (!confirmar) return;

      try {
        await axios.delete(`http://127.0.0.1:8000/api/projetos/${id}/`);
        // Remove a obra da tela
        setProjetos(projetos.filter(p => p.id !== id));
        
        // Remove instantaneamente as tarefas "órfãs" da tela do Kanban
        setTarefas(tarefas.filter(t => t.projeto !== id));
        
      } catch (error) {
        console.error("Erro ao deletar obra definitivamente:", error);
        alert("Ocorreu um erro ao tentar excluir a obra.");
      }
    }
  };

  const aoRestaurarProjeto = async (id, nome) => {
    const confirmar = window.confirm(`Deseja restaurar a obra "${nome}" para os projetos Ativos?`);
    if (!confirmar) return;

    try {
      // Faz um PATCH mandando o arquivado de volta para FALSE
      const res = await axios.patch(`http://127.0.0.1:8000/api/projetos/${id}/`, { arquivado: false });
      
      // Atualiza a tela instantaneamente
      setProjetos(projetos.map(p => p.id === id ? res.data : p));
    } catch (error) {
      console.error("Erro ao restaurar obra:", error);
      alert("Erro ao restaurar a obra.");
    }
  };

  // === FUNÇÕES DE MANIPULAÇÃO DO KANBAN ===
  const aoCriarTarefa = async (novaTarefa) => {
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/tarefas/', novaTarefa);
      setTarefas([...tarefas, res.data]);
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
    }
  };

  const aoDeletarTarefa = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/tarefas/${id}/`);
      setTarefas(tarefas.filter(t => t.id !== id));
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
      
      // BLINDAGEM: Se o Django disser que a tarefa já sumiu (Erro 404), nós limpamos ela da tela à força.
      if (error.response && error.response.status === 404) {
        setTarefas(tarefas.filter(t => t.id !== id));
      } else {
        alert("Ocorreu um erro ao excluir a tarefa.");
      }
    }
  };

  const aoMoverTarefa = async (tarefaId, novoStatus) => {
    const tarefa = tarefas.find(t => t.id === parseInt(tarefaId));
    if (tarefa.status === novoStatus) return;

    try {
      const res = await axios.put(`http://127.0.0.1:8000/api/tarefas/${tarefaId}/`, {
        ...tarefa,
        status: novoStatus
      });
      setTarefas(tarefas.map(t => t.id === parseInt(tarefaId) ? res.data : t));
    } catch (error) {
      console.error("Erro ao mover tarefa:", error);
    }
  };

  // === FUNÇÕES DO CHECKLIST (SUBTAREFAS) ===
  const aoAdicionarSubtarefa = async (tarefaId, titulo) => {
    if (!titulo.trim()) return;
    try {
      const novaSub = { titulo: titulo, concluida: false, tarefa: tarefaId };
      const res = await axios.post('http://127.0.0.1:8000/api/subtarefas/', novaSub);
      
      const novasTarefas = tarefas.map(t => {
        if (t.id === tarefaId) {
          const subsAtuais = t.subtarefas || [];
          return { ...t, subtarefas: [...subsAtuais, res.data] };
        }
        return t;
      });
      setTarefas(novasTarefas);
      
      if (tarefaModal && tarefaModal.id === tarefaId) {
        setTarefaModal(novasTarefas.find(t => t.id === tarefaId));
      }
    } catch (error) {
      console.error("Erro ao adicionar subtarefa", error);
    }
  };

  const aoToggleSubtarefa = async (sub, tarefaId = null) => {
    try {
      const res = await axios.put(`http://127.0.0.1:8000/api/subtarefas/${sub.id}/`, {
        ...sub,
        concluida: !sub.concluida
      });
      
      const tId = tarefaId || sub.tarefa;
      
      const novasTarefas = tarefas.map(t => {
        if (t.id === tId) {
          return {
            ...t,
            subtarefas: t.subtarefas.map(s => s.id === sub.id ? res.data : s)
          };
        }
        return t;
      });
      setTarefas(novasTarefas);
      
      if (tarefaModal && tarefaModal.id === tId) {
        setTarefaModal(novasTarefas.find(t => t.id === tId));
      }
    } catch (error) {
      console.error("Erro ao alterar subtarefa", error);
    }
  };

  const aoDeletarSubtarefa = async (subId, tarefaId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/subtarefas/${subId}/`);
      
      const novasTarefas = tarefas.map(t => {
        if (t.id === tarefaId) {
          return {
            ...t,
            subtarefas: t.subtarefas.filter(s => s.id !== subId)
          };
        }
        return t;
      });
      setTarefas(novasTarefas);
      
      if (tarefaModal && tarefaModal.id === tarefaId) {
        setTarefaModal(novasTarefas.find(t => t.id === tarefaId));
      }
    } catch (error) {
      console.error("Erro ao excluir subtarefa", error);
    }
  };

  const aoSalvarEdicaoModal = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://127.0.0.1:8000/api/tarefas/${tarefaModal.id}/`, tarefaModal);
      setTarefas(tarefas.map(t => t.id === res.data.id ? res.data : t));
      setTarefaModal(null);
    } catch (error) {
      console.error("Erro ao salvar edição da tarefa", error);
    }
  };

  return (
    <div className="app-layout">
      
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-placeholder"></div>
          <h1>Gestão Arquitetônica</h1>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-btn ${abaAtiva === 'kanban' ? 'active' : ''}`} 
            onClick={() => setAbaAtiva('kanban')}
          >
            Quadro Kanban
          </button>
          
          <button 
            className={`nav-btn ${abaAtiva === 'clientes' ? 'active' : ''}`} 
            onClick={() => {
              setAbaAtiva('clientes');
              setProjetoSelecionado(null);
            }}
          >
            Clientes & Obras
          </button>
        </nav>
      </aside>

      {/* CONTEÚDO PRINCIPAL (MAIN) */}
      <main className="main-content">
        {abaAtiva === 'clientes' && (
          projetoSelecionado ? (
            <ClientExplorer 
              projetoSelecionado={projetoSelecionado}
              pastas={pastas}
              arquivos={arquivos}
              aoVoltar={() => setProjetoSelecionado(null)}
            />
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Visão Geral de Obras</h2>
                {/* O Botão agora chama a função que limpa o modal e abre pra Nova Obra */}
                <button className="btn-primary" onClick={abrirModalNovaObra}>
                  + Nova Obra
                </button>
              </div>
              
              <ClientList 
                projetos={projetos} 
                clientes={clientes} 
                aoSelecionarProjeto={setProjetoSelecionado}
                aoDeletarProjeto={aoDeletarProjeto} 
                aoEditarProjeto={abrirModalEdicaoObra} // <- Conectado para quando formos ativar o Lápis!
                aoRestaurarProjeto={aoRestaurarProjeto}
              />
            </>
          )
        )}

        {abaAtiva === 'kanban' && (
          <Kanban
            tarefas={tarefas}
            projetos={projetos}
            clientes={clientes}
            busca={busca}
            setBusca={setBusca}
            aoCriarTarefa={aoCriarTarefa}
            aoDeletarTarefa={aoDeletarTarefa}
            aoMoverTarefa={aoMoverTarefa}
            aoAdicionarSubtarefa={aoAdicionarSubtarefa}
            aoToggleSubtarefa={aoToggleSubtarefa}
            aoDeletarSubtarefa={aoDeletarSubtarefa}
            tarefaModal={tarefaModal}
            setTarefaModal={setTarefaModal}
            aoSalvarEdicaoModal={aoSalvarEdicaoModal}
          />
        )}
      </main>

      {/* MODAL DE CRIAÇÃO/EDIÇÃO (PROJETO/CLIENTE) */}
      {isClientModalOpen && (
        <ClientFormModal
          clientesExistentes={clientes}
          projetoParaEditar={projetoParaEditar}
          aoFechar={aoFecharModalObra}
          aoCriarClienteNovo={aoCriarClienteNovo}
          aoSalvarProjeto={aoSalvarProjeto}
        />
      )}

    </div>
  );
}