import { useState } from "react";
import axios from "axios";
import { API_BASE_URL, ativarConta } from "../../api";
import bgImage from "../../assets/imgLogin.jpg";

export default function Cadastro({ onVoltarLogin }) {
  const [etapa, setEtapa] = useState("FORMULARIO"); // "FORMULARIO" | "OTP"
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codigo, setCodigo] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // ETAPA 1: Enviar dados e receber código no e-mail
  const fazerCadastro = async (e) => {
    e.preventDefault();
    setErro("");

    if (password !== confirmPassword) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      setCarregando(true);
      const res = await axios.post(`${API_BASE_URL}/registrar/`, {
        email: email.trim().toLowerCase(),
        first_name: nome.trim(),
        password: password,
      });

      setSucesso(res.data?.mensagem || "Código de validação enviado para o seu e-mail.");
      setEtapa("OTP");
    } catch (error) {
      if (error.response && error.response.data) {
        if (error.response.data.password) {
          const msg = Array.isArray(error.response.data.password)
            ? error.response.data.password[0]
            : error.response.data.password;
          setErro(msg);
        } else if (error.response.data.email) {
          const msg = Array.isArray(error.response.data.email)
            ? error.response.data.email[0]
            : error.response.data.email;
          setErro(msg);
        } else if (error.response.data.erro) {
          setErro(error.response.data.erro);
        } else {
          setErro("Erro ao realizar cadastro. Verifique os dados informados.");
        }
      } else {
        setErro("Erro de conexão com o servidor.");
      }
    } finally {
      setCarregando(false);
    }
  };

  // ETAPA 2: Validar o código de 6 dígitos e ativar conta
  const validarCodigoAtivacao = async (e) => {
    e.preventDefault();
    setErro("");

    const codigoLimpo = codigo.replace(/\D/g, "");
    if (codigoLimpo.length !== 6) {
      setErro("O código de validação deve conter exatamente 6 dígitos.");
      return;
    }

    try {
      setCarregando(true);
      const res = await ativarConta({
        email: email.trim().toLowerCase(),
        codigo: codigoLimpo,
      });

      setSucesso(res?.mensagem || "Conta ativada com sucesso! Redirecionando para o login...");
      setTimeout(() => {
        onVoltarLogin();
      }, 1800);
    } catch (error) {
      if (error.response?.data?.erro) {
        setErro(error.response.data.erro);
      } else {
        setErro("Código incorreto ou expirado. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 font-sans">
      {/* Lado Esquerdo - Imagem Institucional */}
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

      {/* Lado Direito - Painel Dinâmico (Cadastro / OTP) */}
      <div className="flex flex-col items-center w-full lg:w-1/2 min-h-screen max-h-screen overflow-y-auto py-10 sm:py-14 px-6 sm:px-12 xl:px-20 relative z-10">
        <div className="w-full max-w-md space-y-6 my-auto">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
              {etapa === "FORMULARIO" ? "Criar nova conta" : "Ativação de Conta"}
            </h2>
            <p className="text-slate-500 text-sm">
              {etapa === "FORMULARIO"
                ? "Cadastre-se para acessar a plataforma de projetos."
                : `Digite o código de 6 dígitos enviado para ${email}`}
            </p>
          </div>

          {/* Espaço reservado para mensagens (evita pulo de layout) */}
          <div className="min-h-[56px] flex items-center justify-center">
            {erro ? (
              <div className="w-full p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium animate-fadeIn">
                {erro}
              </div>
            ) : sucesso ? (
              <div className="w-full p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium animate-fadeIn">
                {sucesso}
              </div>
            ) : null}
          </div>

          {/* FLUXO 1: FORMULÁRIO DE CADASTRO */}
          {etapa === "FORMULARIO" && (
            <form onSubmit={fazerCadastro} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Nome Completo
                </label>
                <input
                  type="text"
                  autoFocus
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-xs"
                  placeholder="Ex: Arquiteto Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  E-mail Profissional
                </label>
                <input
                  type="email"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-xs"
                  placeholder="arq@escritorio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Senha
                  </label>
                  <input
                    type="password"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-xs"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-xs"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-sm transition-all active:scale-[0.98] mt-3 cursor-pointer"
              >
                {carregando ? "Enviando código..." : "Cadastrar e Enviar Código"}
              </button>
            </form>
          )}

          {/* FLUXO 2: VALIDAÇÃO DO CÓDIGO OTP */}
          {etapa === "OTP" && (
            <form onSubmit={validarCodigoAtivacao} className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="text-xs text-indigo-950">
                  <p className="font-bold m-0">Verifique sua caixa de entrada</p>
                  <p className="text-indigo-700 m-0 mt-0.5">Enviamos um código de verificação para {email}.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 text-center uppercase tracking-wide">
                  Código de 6 Dígitos
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3.5 text-center text-3xl font-mono font-extrabold text-slate-900 tracking-[0.5em] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-xs"
                  placeholder="000000"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={carregando || codigo.length !== 6}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                {carregando ? "Validando..." : "Confirmar e Ativar Conta"}
              </button>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEtapa("FORMULARIO");
                    setErro("");
                    setSucesso("");
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  ← Corrigir E-mail
                </button>
                <button
                  type="button"
                  onClick={fazerCadastro}
                  disabled={carregando}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                >
                  Reenviar Código
                </button>
              </div>
            </form>
          )}

          <div className="text-center pt-2 border-t border-slate-100">
            <span className="text-sm text-slate-500">
              Já possui uma conta ativa?{" "}
            </span>
            <button
              onClick={onVoltarLogin}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 cursor-pointer"
            >
              Fazer Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
