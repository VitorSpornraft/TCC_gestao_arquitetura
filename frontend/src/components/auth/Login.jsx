import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../api";
import bgImage from "../../assets/imgLogin.jpg";
import RecuperarSenhaModal from "./RecuperarSenhaModal";

export default function Login({ onLoginSucesso, onAbrirCadastro, onAbrirCliente }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [sucessoRecuperacao, setSucessoRecuperacao] = useState("");
  const [lembrar, setLembrar] = useState(true);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [modalRecuperacaoAberto, setModalRecuperacaoAberto] = useState(false);

  const fazerLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/token/`, {
        username,
        password,
      });

      const nomeParaSalvar = username.split("@")[0];

      if (lembrar) {
        localStorage.setItem("token", res.data.access);
        localStorage.setItem("usuario_nome", nomeParaSalvar);
      } else {
        sessionStorage.setItem("token", res.data.access);
        sessionStorage.setItem("usuario_nome", nomeParaSalvar);
      }

      onLoginSucesso();
    } catch {
      setErro("Credenciais inválidas. Tente novamente.");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 font-sans">
      {/* Lado Esquerdo - Imagem */}
      <div className="hidden lg:flex relative w-1/2 min-h-screen bg-slate-200">
        <div className="absolute top-10 left-10 z-10 flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-md text-indigo-700 font-bold text-sm rounded-xl shadow-sm">
            GA
          </div>
          <span className="text-white font-semibold text-base tracking-wide drop-shadow-md">
            Gestão Arquitetônica
          </span>
        </div>

        <img
          src={bgImage}
          alt="Detalhe arquitetônico"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="flex flex-col items-center w-full lg:w-1/2 min-h-screen max-h-screen overflow-y-auto py-10 sm:py-14 px-6 sm:px-12 xl:px-20 relative z-10">
        <div className="w-full max-w-md space-y-6 my-auto">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">
              Entrar na plataforma
            </h2>
            <p className="text-slate-500 text-base">
              Insira suas credenciais para acessar o painel.
            </p>
          </div>

          {/* Espaço reservado para mensagem de erro/status para evitar pulo brusco no layout */}
          <div className="min-h-[56px] flex items-center justify-center">
            {erro ? (
              <div className="w-full p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium text-center animate-fadeIn">
                {erro}
              </div>
            ) : sucessoRecuperacao ? (
              <div className="w-full p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium text-center animate-fadeIn">
                {sucessoRecuperacao}
              </div>
            ) : null}
          </div>

          <form onSubmit={fazerLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
                E-mail
              </label>
              <input
                type="text"
                autoFocus
                className="w-full bg-white border border-slate-300 rounded-xl px-5 py-4 text-base text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setErro("");
                    setSucessoRecuperacao("");
                    setModalRecuperacaoAberto(true);
                  }}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-5 pr-14 py-4 text-base text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {mostrarSenha ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 pb-2">
              <input
                type="checkbox"
                id="lembrar"
                checked={lembrar}
                onChange={(e) => setLembrar(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label
                htmlFor="lembrar"
                className="text-sm text-slate-600 cursor-pointer select-none"
              >
                Manter sessão neste dispositivo
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base py-4 px-4 rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              Entrar
            </button>
          </form>

          {/* NOVO BLOCO: DIVISÓRIA E BOTÃO DO PORTAL DO CLIENTE */}
          <div className="pt-2">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-50 text-slate-500 font-medium">
                  Acesso Externo
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onAbrirCliente}
              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-base py-4 px-4 rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              Entrar como Cliente
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>

          <div className="text-center pt-2">
            <span className="text-sm text-slate-500">
              Ainda não tem conta?{" "}
            </span>
            <button
              type="button"
              onClick={onAbrirCadastro}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 cursor-pointer"
            >
              Criar conta
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Recuperação de Senha com OTP */}
      <RecuperarSenhaModal
        isOpen={modalRecuperacaoAberto}
        onClose={() => setModalRecuperacaoAberto(false)}
        onSucesso={(emailRecuperado) => {
          setUsername(emailRecuperado);
          setSucessoRecuperacao("Senha alterada com sucesso! Entre agora com sua nova senha.");
        }}
      />
    </div>
  );
}
