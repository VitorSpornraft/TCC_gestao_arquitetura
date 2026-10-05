import { useState } from "react";
import { solicitarRecuperacaoSenha, redefinirSenha } from "../../api";

export default function RecuperarSenhaModal({ isOpen, onClose, onSucesso }) {
  const [etapa, setEtapa] = useState(1); // 1: Pedir e-mail, 2: Digitar código e nova senha
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  if (!isOpen) return null;

  // ETAPA 1: Solicitar código OTP para o e-mail
  const handleSolicitarCodigo = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    try {
      setCarregando(true);
      const res = await solicitarRecuperacaoSenha({ email: email.trim().toLowerCase() });
      setSucesso(res?.mensagem || "Código enviado para o seu e-mail!");
      setEtapa(2);
    } catch (error) {
      if (error.response?.data?.erro) {
        setErro(error.response.data.erro);
      } else {
        setErro("Não foi possível solicitar a recuperação. Verifique o e-mail.");
      }
    } finally {
      setCarregando(false);
    }
  };

  // ETAPA 2: Redefinir senha com o código
  const handleRedefinirSenha = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (novaSenha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    const codigoLimpo = codigo.replace(/\D/g, "");
    if (codigoLimpo.length !== 6) {
      setErro("O código de validação deve conter 6 dígitos.");
      return;
    }

    try {
      setCarregando(true);
      const res = await redefinirSenha({
        email: email.trim().toLowerCase(),
        codigo: codigoLimpo,
        nova_senha: novaSenha,
      });

      setSucesso(res?.mensagem || "Senha redefinida com sucesso!");
      setTimeout(() => {
        if (onSucesso) onSucesso(email);
        onClose();
      }, 1500);
    } catch (error) {
      if (error.response?.data?.nova_senha) {
        const msg = Array.isArray(error.response.data.nova_senha)
          ? error.response.data.nova_senha[0]
          : error.response.data.nova_senha;
        setErro(msg);
      } else if (error.response?.data?.password) {
        const msg = Array.isArray(error.response.data.password)
          ? error.response.data.password[0]
          : error.response.data.password;
        setErro(msg);
      } else if (error.response?.data?.erro) {
        setErro(error.response.data.erro);
      } else {
        setErro("Código incorreto ou expirado. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl animate-slideUp">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0">
                {etapa === 1 ? "Recuperar Senha" : "Criar Nova Senha"}
              </h3>
              <span className="text-xs text-slate-400">Etapa {etapa} de 2</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg text-lg font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Mensagens de Feedback */}
        {erro && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-medium animate-fadeIn">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-medium animate-fadeIn">
            {sucesso}
          </div>
        )}

        {/* ETAPA 1: INFORMAR E-MAIL */}
        {etapa === 1 && (
          <form onSubmit={handleSolicitarCodigo} className="space-y-4 mt-5">
            <p className="text-xs text-slate-500 m-0">
              Informe o e-mail da sua conta de arquiteto. Enviaremos um código OTP de 6 dígitos para você redefinir sua senha.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Seu E-mail Cadastrado
              </label>
              <input
                type="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arq@escritorio.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={carregando}
                className="flex-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                {carregando ? "Enviando..." : "Enviar Código"}
              </button>
            </div>
          </form>
        )}

        {/* ETAPA 2: DIGITAR CÓDIGO E DEFINIR NOVA SENHA */}
        {etapa === 2 && (
          <form onSubmit={handleRedefinirSenha} className="space-y-4 mt-5 animate-fadeIn">
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900">
              Código enviado para <strong>{email}</strong>.
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 text-center uppercase tracking-wide">
                Código de 6 Dígitos
              </label>
              <input
                type="text"
                maxLength={6}
                autoFocus
                required
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-center text-2xl font-mono font-extrabold text-slate-900 tracking-[0.4em] focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Nova Senha
              </label>
              <input
                type="password"
                required
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                required
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEtapa(1)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={carregando || codigo.length !== 6}
                className="flex-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                {carregando ? "Salvando..." : "Redefinir Senha"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
