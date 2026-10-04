import { useState, useEffect } from "react";

const baseInputClass =
  "bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all";
const inputClass = `w-full ${baseInputClass}`;

export default function NewClientModal({
  clienteParaEditar = null,
  aoFechar,
  aoCriarCliente,
  aoEditarCliente,
}) {
  const isEdicao = Boolean(clienteParaEditar);
  const [nome, setNome] = useState(clienteParaEditar?.nome || "");
  const [ddd, setDdd] = useState(clienteParaEditar?.ddd || "");
  const [telefone, setTelefone] = useState(clienteParaEditar?.telefone || "");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (clienteParaEditar) {
      setNome(clienteParaEditar.nome || "");
      setDdd(clienteParaEditar.ddd || "");
      setTelefone(clienteParaEditar.telefone || "");
    } else {
      setNome("");
      setDdd("");
      setTelefone("");
    }
  }, [clienteParaEditar]);

  const handleTelefoneChange = (e) => {
    let num = e.target.value.replace(/\D/g, "").slice(0, 9);
    if (num.length === 9) num = num.replace(/(\d{5})(\d{4})/, "$1-$2");
    else if (num.length > 4) num = num.replace(/(\d{4})(\d+)/, "$1-$2");
    setTelefone(num);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setSalvando(true);
    try {
      const payload = {
        nome: nome.trim(),
        ddd: ddd.replace(/\D/g, "").slice(0, 2),
        telefone,
        ddi: "+55",
      };

      const res = isEdicao
        ? await aoEditarCliente(clienteParaEditar.id, payload)
        : await aoCriarCliente(payload);

      if (res) {
        aoFechar();
      }
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-5 animate-slideUp">
        <header className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 m-0">
              {isEdicao ? "Editar Cliente" : "Cadastrar Novo Cliente"}
            </h3>
            <p className="text-xs text-zinc-500 m-0 mt-0.5">
              {isEdicao
                ? "Atualize as informações cadastrais do cliente"
                : "Insira os dados do cliente para adicioná-lo à base"}
            </p>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            className="text-zinc-400 hover:text-zinc-900 text-lg transition-colors p-1 cursor-pointer"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              Nome do Cliente <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Ana Maria Silva"
              className={inputClass}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              Telefone (Opcional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="DDD"
                maxLength={2}
                className={`w-16 shrink-0 ${baseInputClass} text-center`}
                value={ddd}
                onChange={(e) => setDdd(e.target.value.replace(/\D/g, "").slice(0, 2))}
              />
              <input
                type="text"
                placeholder="99999-9999"
                className={`flex-1 min-w-0 ${baseInputClass}`}
                value={telefone}
                onChange={handleTelefoneChange}
              />
            </div>
          </div>

          <footer className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={aoFechar}
              disabled={salvando}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {salvando
                ? "Salvando..."
                : isEdicao
                  ? "Salvar Alterações"
                  : "Cadastrar Cliente"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
