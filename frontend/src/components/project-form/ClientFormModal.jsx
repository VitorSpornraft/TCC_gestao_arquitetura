import { useEffect, useState } from "react";
import ClientSection from "./ClientSection";
import ProjectSection from "./ProjectSection";

const INITIAL_PROJECT = {
  nome_projeto: "",
  tipo_projeto: "",
  fase_atual: "",
  cep: "",
  rua: "",
  numero: "",
  bairro: "",
  cidade: "",
  uf: "",
};
const INITIAL_CLIENT = {
  nome: "",
  foto: "",
  ddi: "+55",
  ddd: "",
  telefone: "",
};

export default function ClientFormModal({
  projetoParaEditar,
  clientesExistentes = [],
  aoSalvarProjeto,
  aoCriarClienteNovo,
  aoFechar,
}) {
  const [formProjeto, setFormProjeto] = useState(INITIAL_PROJECT);
  const [formCliente, setFormCliente] = useState(INITIAL_CLIENT);
  const [modoCliente, setModoCliente] = useState("existente");
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const isEdicao = Boolean(projetoParaEditar);

  useEffect(() => {
    if (!projetoParaEditar) {
      setFormProjeto(INITIAL_PROJECT);
      setFormCliente(INITIAL_CLIENT);
      setClienteSelecionadoId("");
      return;
    }
    let cep = projetoParaEditar.cep
      ? projetoParaEditar.cep.replace(/\D/g, "")
      : "";
    if (cep.length > 5) cep = cep.replace(/(\d{5})(\d+)/, "$1-$2");
    setFormProjeto({ ...projetoParaEditar, cep });
    setClienteSelecionadoId(
      typeof projetoParaEditar.cliente === "object"
        ? projetoParaEditar.cliente?.id || ""
        : projetoParaEditar.cliente || "",
    );
    setModoCliente("existente");
  }, [projetoParaEditar]);

  const buscarCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;
    setBuscandoCep(true);
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const endereco = await resposta.json();
      if (!endereco.erro)
        setFormProjeto((atual) => ({
          ...atual,
          rua: endereco.logradouro,
          bairro: endereco.bairro,
          cidade: endereco.localidade,
          uf: endereco.uf,
        }));
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleTelefoneChange = (event) => {
    let telefone = event.target.value.replace(/\D/g, "").slice(0, 9);
    telefone =
      telefone.length === 9
        ? telefone.replace(/(\d{5})(\d{4})/, "$1-$2")
        : telefone.length > 4
          ? telefone.replace(/(\d{4})(\d+)/, "$1-$2")
          : telefone;
    setFormCliente({ ...formCliente, telefone });
  };

  const handleDDDChange = (event) =>
    setFormCliente({
      ...formCliente,
      ddd: event.target.value.replace(/\D/g, "").slice(0, 2),
    });

  const handleCepChange = (event) => {
    let cep = event.target.value.replace(/\D/g, "").slice(0, 8);
    if (cep.length > 5) cep = cep.replace(/(\d{5})(\d+)/, "$1-$2");
    setFormProjeto({ ...formProjeto, cep });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let cliente = clienteSelecionadoId;
    if (modoCliente === "novo") {
      const novoCliente = await aoCriarClienteNovo(formCliente);
      if (!novoCliente?.id)
        return alert("Erro ao criar o novo cliente. Verifique a conexão.");
      cliente = novoCliente.id;
    }
    if (!cliente)
      return alert("Por favor, selecione um cliente ou crie um novo.");
    aoSalvarProjeto({ ...formProjeto, cliente });
  };

  const clientesAtivos = Array.isArray(clientesExistentes)
    ? clientesExistentes.filter(
        (cliente) => cliente && !cliente.arquivado && !cliente.deletado,
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-xl p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-slideUp">
        <header className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-100">
          <h3 className="text-lg font-semibold text-zinc-900 m-0">
            {isEdicao ? "Editar Projeto / Obra" : "Cadastrar Novo Projeto"}
          </h3>
          <button
            type="button"
            onClick={aoFechar}
            className="text-zinc-400 hover:text-zinc-900 text-lg transition-colors p-1 cursor-pointer"
          >
            ✕
          </button>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ClientSection
            isEdicao={isEdicao}
            modoCliente={modoCliente}
            setModoCliente={setModoCliente}
            clientes={clientesAtivos}
            clienteId={clienteSelecionadoId}
            setClienteId={setClienteSelecionadoId}
            cliente={formCliente}
            setCliente={setFormCliente}
            onDDDChange={handleDDDChange}
            onTelefoneChange={handleTelefoneChange}
          />
          <ProjectSection
            projeto={formProjeto}
            setProjeto={setFormProjeto}
            buscandoCep={buscandoCep}
            onCepChange={handleCepChange}
            onCepBlur={buscarCep}
          />
          <footer className="flex justify-end gap-3 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={aoFechar}
              className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all cursor-pointer"
            >
              {isEdicao ? "Salvar Alterações" : "Cadastrar Projeto"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
