import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
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
import ClientFilePage from "./components/client-portal/ClientFilePage";
import useWorkspaceData from "./hooks/useWorkspaceData";
import useProjectOperations from "./hooks/useProjectOperations";
import useTaskOperations from "./hooks/useTaskOperations";
import api from "./api";

export default function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => {
    return (
      localStorage.getItem("access") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("access") ||
      sessionStorage.getItem("token") ||
      null
    );
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("userRole") || sessionStorage.getItem("userRole") || null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const t =
      localStorage.getItem("access") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("access") ||
      sessionStorage.getItem("token");
    const role = localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
    return Boolean(t && role === "arquiteto");
  });

  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [modoCliente, setModoCliente] = useState(() => {
    const role = localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
    return role === "cliente";
  });

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

  // Inicialização e proteção de rotas no F5
  useEffect(() => {
    const tokenAtual =
      localStorage.getItem("access") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("access") ||
      sessionStorage.getItem("token");
    const roleAtual =
      localStorage.getItem("userRole") || sessionStorage.getItem("userRole");

    if (tokenAtual) {
      // Garante injeção do header de autorização na instância do Axios
      api.defaults.headers.common["Authorization"] = `Bearer ${tokenAtual}`;
      setToken(tokenAtual);

      if (roleAtual === "cliente") {
        setUserRole("cliente");
        setModoCliente(true);
        setIsLoggedIn(false);
        carregarDados();
      } else if (roleAtual === "arquiteto") {
        setUserRole("arquiteto");
        setModoCliente(false);
        setIsLoggedIn(true);
        carregarDados();
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
      setToken(null);
    }
  }, [carregarDados]);

  // Recarrega dados ao trocar de abas (apenas se for arquiteto logado)
  useEffect(() => {
    if (isLoggedIn && userRole === "arquiteto") {
      carregarDados();
    }
  }, [abaAtiva, isLoggedIn, userRole, carregarDados]);

  const fazerLogout = () => {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("access");
    sessionStorage.removeItem("access");
    localStorage.removeItem("refresh");
    sessionStorage.removeItem("refresh");
    localStorage.removeItem("userRole");
    sessionStorage.removeItem("userRole");
    localStorage.removeItem("cliente_id");
    sessionStorage.removeItem("cliente_id");
    localStorage.removeItem("cliente_info");
    sessionStorage.removeItem("cliente_info");
    localStorage.removeItem("usuario_nome");
    sessionStorage.removeItem("usuario_nome");
    setToken(null);
    setIsLoggedIn(false);
    setUserRole(null);
    setModoCliente(false);
    setProjetoSelecionado(null);
    navigate("/");
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

  const renderPainelArquiteto = () => (
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

  const temToken = Boolean(
    token || localStorage.getItem("token") || sessionStorage.getItem("token")
  );
  const ehCliente =
    userRole === "cliente" ||
    modoCliente ||
    localStorage.getItem("userRole") === "cliente";

  return (
    <Routes>
      {/* ROTA PROTEGIDA: PÁGINA DO ARQUIVO DO CLIENTE */}
      <Route
        path="/portal/arquivo/:id"
        element={
          temToken ? (
            <ClientFilePage onAtualizarDados={carregarDados} />
          ) : (
            <Navigate to="/portal" replace />
          )
        }
      />

      {/* ROTA DO PORTAL DO CLIENTE */}
      <Route
        path="/portal"
        element={
          <ClientPortal
            clientes={clientes}
            projetos={projetos}
            pastas={pastas}
            arquivos={arquivos}
            onVoltar={() => {
              setModoCliente(false);
              setUserRole(null);
              navigate("/");
            }}
            onAtualizarDados={carregarDados}
            onLoginSucesso={(_clienteInfo) => {
              const t =
                localStorage.getItem("access") ||
                localStorage.getItem("token") ||
                sessionStorage.getItem("access") ||
                sessionStorage.getItem("token");
              setToken(t);
              setUserRole("cliente");
              setModoCliente(true);
              setIsLoggedIn(false);
              carregarDados();
            }}
            onLogout={fazerLogout}
          />
        }
      />

      {/* ROTA RAIZ */}
      <Route
        path="/"
        element={
          ehCliente ? (
            <Navigate to="/portal" replace />
          ) : !isLoggedIn || userRole !== "arquiteto" ? (
            mostrarCadastro ? (
              <Cadastro onVoltarLogin={() => setMostrarCadastro(false)} />
            ) : (
              <Login
                carregarDados={carregarDados}
                onLoginSucesso={async () => {
                  const t =
                    localStorage.getItem("access") ||
                    localStorage.getItem("token") ||
                    sessionStorage.getItem("access") ||
                    sessionStorage.getItem("token");
                  setToken(t);
                  setUserRole("arquiteto");
                  setIsLoggedIn(true);
                  await carregarDados();
                }}
                onAbrirCadastro={() => setMostrarCadastro(true)}
                onAbrirCliente={() => {
                  carregarDados();
                  setModoCliente(true);
                  navigate("/portal");
                }}
              />
            )
          ) : (
            renderPainelArquiteto()
          )
        }
      />

      {/* ROTA DASHBOARD (ALINHADA COM ARQUITETO) */}
      <Route
        path="/dashboard"
        element={<Navigate to="/" replace />}
      />

      {/* FALLBACK PARA QUALQUER OUTRA ROTA */}
      <Route
        path="*"
        element={<Navigate to={ehCliente ? "/portal" : "/"} replace />}
      />
    </Routes>
  );
}
