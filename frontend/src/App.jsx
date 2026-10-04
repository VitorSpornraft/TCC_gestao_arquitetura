import { useState, useEffect } from "react";
import ClientList from "./components/client-list/ClientList";
import NewClientModal from "./components/client-list/NewClientModal";
import ClientExplorer from "./components/client-explorer/ClientExplorer";
import Kanban from "./components/kanban/Kanban";
import ClientFormModal from "./components/project-form/ClientFormModal";
import ConfirmActionModal from "./components/modals/ConfirmActionModal";
import Navbar from "./components/navbar/Navbar";
import Login from "./components/auth/Login";
import Cadastro from "./components/auth/Cadastro";
import Analytics from "./components/analytics/Analytics";
import Calendar from "./components/calendar/Calendar";
import ClientPortal from "./components/client-portal/ClientPortal";
import useWorkspaceData from "./hooks/useWorkspaceData";
import useProjectOperations from "./hooks/useProjectOperations";
import useTaskOperations from "./hooks/useTaskOperations";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [modoCliente, setModoCliente] = useState(false);

  const {
    clientes,
    setClientes,
    projetos,
    setProjetos,
    tarefas,
    setTarefas,
    pastas,
    arquivos,
    carregarDados,
  } = useWorkspaceData();

  const [abaAtiva, setAbaAtiva] = useState("kanban");
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);
  const [busca, setBusca] = useState("");

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [projetoParaEditar, setProjetoParaEditar] = useState(null);
  const [clienteParaEditar, setClienteParaEditar] = useState(null);
  const [tarefaModal, setTarefaModal] = useState(null);
  const [confirmacao, setConfirmacao] = useState(null);

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      carregarDados();
    }
  }, [carregarDados, abaAtiva]);

  const fazerLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
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

  const abrirModalNovoCliente = () => {
    setClienteParaEditar(null);
    setIsNewClientModalOpen(true);
  };

  const abrirModalEdicaoCliente = (cliente) => {
    setClienteParaEditar(cliente);
    setIsNewClientModalOpen(true);
  };

  const aoFecharModalCliente = () => {
    setIsNewClientModalOpen(false);
    setClienteParaEditar(null);
  };

  const {
    aoCriarClienteNovo,
    aoSalvarProjeto,
    aoDeletarProjeto,
    aoRestaurarProjeto,
    aoDeletarCliente,
    aoEditarCliente,
    aoRestaurarCliente,
  } = useProjectOperations({
    clientes,
    setClientes,
    projetos,
    setProjetos,
    tarefas,
    setTarefas,
    carregarDados,
    aoFecharModalObra,
    setConfirmacao,
  });

  const {
    aoCriarTarefa,
    aoDeletarTarefa,
    aoRestaurarTarefa,
    aoExcluirTarefaPermanentemente,
    aoMoverTarefa,
    aoAdicionarSubtarefa,
    aoToggleSubtarefa,
    aoDeletarSubtarefa,
    aoSalvarEdicaoModal,
  } = useTaskOperations({
    tarefas,
    setTarefas,
    tarefaModal,
    setTarefaModal,
  });

  // --- FLUXO DE ENTRADA (ARQUITETO VS CLIENTE) ---
  if (!isLoggedIn) {
    if (modoCliente) {
      return (
        <ClientPortal
          clientes={clientes}
          projetos={projetos}
          pastas={pastas}
          arquivos={arquivos}
          onVoltar={() => setModoCliente(false)}
          onAtualizarDados={carregarDados}
        />
      );
    }

    if (mostrarCadastro) {
      return <Cadastro onVoltarLogin={() => setMostrarCadastro(false)} />;
    }

    return (
      <Login
        onLoginSucesso={() => {
          setIsLoggedIn(true);
          carregarDados();
        }}
        onAbrirCadastro={() => setMostrarCadastro(true)}
        onAbrirCliente={() => {
          carregarDados();
          setModoCliente(true);
        }}
      />
    );
  }

  // --- RENDERIZAÇÃO DO SISTEMA INTERNO (ARQUITETO LOGADO) ---
  return (
    <div className="flex h-screen w-full bg-zinc-50 overflow-hidden font-sans">
      <Navbar
        telaAtual={abaAtiva}
        setTelaAtual={setAbaAtiva}
        setClienteSelecionado={() => setProjetoSelecionado(null)}
        aoSair={fazerLogout}
      />

      <main className="flex-1 h-full overflow-y-auto w-full p-8 bg-zinc-50/50">
        {abaAtiva === "clientes" &&
          (projetoSelecionado ? (
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
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 m-0">
                    Clientes & Obras
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                    onClick={abrirModalNovoCliente}
                  >
                    + Novo Cliente
                  </button>
                  <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
                    onClick={abrirModalNovaObra}
                  >
                    + Nova Obra
                  </button>
                </div>
              </div>
              <ClientList
                projetos={projetos}
                clientes={clientes}
                aoSelecionarProjeto={setProjetoSelecionado}
                aoDeletarProjeto={aoDeletarProjeto}
                aoEditarProjeto={abrirModalEdicaoObra}
                aoRestaurarProjeto={aoRestaurarProjeto}
                aoDeletarCliente={aoDeletarCliente}
                aoEditarCliente={abrirModalEdicaoCliente}
                aoRestaurarCliente={aoRestaurarCliente}
                aoAbrirNovoCliente={abrirModalNovoCliente}
              />
            </div>
          ))}

        {abaAtiva === "kanban" && (
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

        {abaAtiva === "analytics" && (
          <Analytics
            projetos={projetos}
            tarefas={tarefas}
            arquivos={arquivos}
            carregarDados={carregarDados}
          />
        )}

        {abaAtiva === "calendar" && (
          <Calendar projetos={projetos} tarefas={tarefas} />
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
      {isNewClientModalOpen && (
        <NewClientModal
          clienteParaEditar={clienteParaEditar}
          aoFechar={aoFecharModalCliente}
          aoCriarCliente={aoCriarClienteNovo}
          aoEditarCliente={aoEditarCliente}
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
