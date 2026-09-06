import { useState, useEffect } from 'react';
import ClientList from "./components/ClientList";
import ClientExplorer from './components/ClientExplorer';
import Kanban from './components/Kanban';
import ClientFormModal from './components/ClientFormModal';
import ConfirmActionModal from './components/modals/ConfirmActionModal';
import Navbar from './components/Navbar';
import Login from './components/Login';
import axios from 'axios';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [clientes, setClientes] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [pastas, setPastas] = useState([]);
  const [arquivos, setArquivos] = useState([]);
  
  const [abaAtiva, setAbaAtiva] = useState('kanban');
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);
  const [busca, setBusca] = useState('');
  
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [projetoParaEditar, setProjetoParaEditar] = useState(null);
  const [tarefaModal, setTarefaModal] = useState(null);
  const [confirmacao, setConfirmacao] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      carregarDados();
    }
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

  const fazerLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setProjetoSelecionado(null);
  };

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
      return res.data;
    } catch (error) {
      console.error("Erro ao criar novo cliente:", error);
      return null;
    }
  };

  const aoSalvarProjeto = async (dadosProjeto) => {
    try {
      if (dadosProjeto.id) {
        await axios.put(`http://127.0.0.1:8000/api/projetos/${dadosProjeto.id}/`, dadosProjeto);
      } else {
        await axios.post('http://127.0.0.1:8000/api/projetos/', dadosProjeto);
      }
      carregarDados();
      aoFecharModalObra();
    } catch (error) {
      console.error("Erro ao salvar a obra:", error);
      alert("Ocorreu um erro ao salvar a obra.");
    }
  };

  const aoDeletarProjeto = (id, nome) => {
    const projeto = projetos.find(p => p.id === id);
    if (!projeto.arquivado) {
      setConfirmacao({
        titulo: "Arquivar obra",
        mensagem: `Deseja enviar a obra "${nome}" para os Arquivados?`,
        textoConfirmar: "Arquivar",
        variante: "aviso",
        aoConfirmar: async () => {
          try {
            const res = await axios.patch(`http://127.0.0.1:8000/api/projetos/${id}/`, { arquivado: true });
            setProjetos(projetos.map(p => p.id === id ? res.data : p));
          } catch (error) { console.error("Erro ao arquivar obra:", error); }
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
            await axios.delete(`http://127.0.0.1:8000/api/projetos/${id}/`);
            setProjetos(projetos.filter(p => p.id !== id));
            setTarefas(tarefas.filter(t => t.projeto !== id));
          } catch (error) { console.error("Erro ao deletar obra:", error); }
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
          const res = await axios.patch(`http://127.0.0.1:8000/api/projetos/${id}/`, { arquivado: false });
          setProjetos(projetos.map(p => p.id === id ? res.data : p));
        } catch (error) { console.error("Erro ao restaurar obra:", error); }
      },
    });
  };

  const aoCriarTarefa = async (dadosTarefa) => {
    try {
      const { checklistTemplate, ...dadosParaEnviar } = dadosTarefa;
      const res = await axios.post('http://127.0.0.1:8000/api/tarefas/', dadosParaEnviar);
      const novaTarefaCriada = res.data;

      if (checklistTemplate && checklistTemplate.length > 0) {
        const novasSubtarefas = [];
        for (const item of checklistTemplate) {
          const subRes = await axios.post('http://127.0.0.1:8000/api/subtarefas/', {
            titulo: item,
            concluida: false,
            tarefa: novaTarefaCriada.id
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
      const res = await axios.patch(`http://127.0.0.1:8000/api/tarefas/${id}/`, {
        arquivado: true,
      });
      setTarefas(tarefas.map((item) => item.id === id ? { ...item, ...res.data } : item));
    } catch (error) {
      console.error("Erro ao arquivar tarefa:", error);
    }
  };

  const aoRestaurarTarefa = async (id) => {
    try {
      const res = await axios.patch(`http://127.0.0.1:8000/api/tarefas/${id}/`, {
        arquivado: false,
      });
      setTarefas(tarefas.map((item) => item.id === id ? { ...item, ...res.data } : item));
    } catch (error) {
      console.error("Erro ao restaurar tarefa:", error);
    }
  };

  const aoExcluirTarefaPermanentemente = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/tarefas/${id}/`);
      setTarefas(tarefas.filter((item) => item.id !== id));
      if (tarefaModal?.id === id) setTarefaModal(null);
    } catch (error) {
      console.error("Erro ao excluir tarefa permanentemente:", error);
    }
  };

  const aoMoverTarefa = async (tarefaId, novoStatus) => {
    const tarefa = tarefas.find(t => t.id === parseInt(tarefaId));
    if (!tarefa || tarefa.status === novoStatus) return;
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

  const aoAdicionarSubtarefa = async (tarefaId, titulo) => {
    if (!titulo || !titulo.trim()) return;
    try {
      const novaSub = { titulo: titulo.trim(), concluida: false, tarefa: tarefaId };
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
    if (!tarefaModal) return;
    try {
      const dadosAtualizados = {
        titulo: tarefaModal.titulo,
        categoria: tarefaModal.categoria,
        prazo: tarefaModal.prazo,
        prioridade: tarefaModal.prioridade || 'normal',
        status: tarefaModal.status,
        projeto: typeof tarefaModal.projeto === 'object' ? tarefaModal.projeto.id : tarefaModal.projeto
      };

      const res = await axios.put(`http://127.0.0.1:8000/api/tarefas/${tarefaModal.id}/`, dadosAtualizados);
      
      setTarefas(tarefas.map(t => t.id === res.data.id ? { ...res.data, subtarefas: t.subtarefas } : t));
      setTarefaModal(null);
    } catch (error) {
      console.error("Erro ao salvar edição da tarefa:", error.response?.data || error);
      alert("Ocorreu um erro ao salvar a tarefa. Verifique o console.");
    }
  };

  if (!isLoggedIn) {
    return (
      <Login 
        onLoginSucesso={() => {
          setIsLoggedIn(true);
          carregarDados();
        }} 
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-zinc-50 overflow-hidden font-sans">
      <Navbar 
        telaAtual={abaAtiva} 
        setTelaAtual={setAbaAtiva} 
        setClienteSelecionado={() => setProjetoSelecionado(null)} 
        aoSair={fazerLogout}
      />

      <main className="flex-1 h-full overflow-y-auto w-full p-8 bg-zinc-50/50">
        {abaAtiva === 'clientes' && (
          projetoSelecionado ? (
            <ClientExplorer 
              projetoSelecionado={projetoSelecionado}
              clientes={clientes}
              pastas={pastas}
              arquivos={arquivos}
              tarefas={tarefas}
              aoVoltar={() => setProjetoSelecionado(null)}
              aoAtualizarDados={carregarDados}
            />
          ) : (
            <div className="w-full">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-zinc-900">Visão Geral de Obras</h2>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all" onClick={abrirModalNovaObra}>
                  + Nova Obra
                </button>
              </div>
              <ClientList 
                projetos={projetos} 
                clientes={clientes} 
                aoSelecionarProjeto={setProjetoSelecionado}
                aoDeletarProjeto={aoDeletarProjeto} 
                aoEditarProjeto={abrirModalEdicaoObra}
                aoRestaurarProjeto={aoRestaurarProjeto}
              />
            </div>
          )
        )}

        {abaAtiva === 'kanban' && (
          <Kanban
            tarefas={tarefas}
            projetos={projetos}
            clientes={clientes}
            arquivos={arquivos}
            busca={busca}
            setBusca={setBusca}
            aoCriarTarefa={aoCriarTarefa}
            aoDeletarTarefa={aoDeletarTarefa}
            aoRestaurarTarefa={aoRestaurarTarefa}
            aoExcluirTarefaPermanentemente={aoExcluirTarefaPermanentemente}
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

      {isClientModalOpen && (
        <ClientFormModal
          clientesExistentes={clientes}
          projetoParaEditar={projetoParaEditar}
          aoFechar={aoFecharModalObra}
          aoCriarClienteNovo={aoCriarClienteNovo}
          aoSalvarProjeto={aoSalvarProjeto}
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
