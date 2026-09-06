import { useState } from 'react';
import axios from 'axios';

export default function Login({ onLoginSucesso }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');

  const fazerLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/token/', {
        username,
        password
      });
      localStorage.setItem('token', res.data.access);
      onLoginSucesso();
    } catch (error) {
      setErro('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 w-full h-screen flex items-center justify-center bg-slate-100 p-4 z-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Acesso ao Sistema</h2>
          <p className="text-slate-500 text-sm mt-1">Insira suas credenciais para continuar</p>
        </div>

        {erro && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium text-center">
            {erro}
          </div>
        )}

        <form onSubmit={fazerLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Usuário</label>
            <input type="text" autoFocus className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Senha</label>
            <input type="password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-transform active:scale-[0.98] cursor-pointer">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}