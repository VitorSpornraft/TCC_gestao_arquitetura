import { useState, useEffect } from 'react';
import axios from 'axios';

export default function HistoricoModal({ arquivoId, arquivoNome, onClose }) {
  const [versoes, setVersoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!arquivoId) return;
    axios.get(`http://127.0.0.1:8000/api/arquivos/${arquivoId}/historico/`)
      .then(res => {
        setVersoes(res.data);
        setCarregando(false);
      })
      .catch(err => {
        console.error("Erro ao buscar histórico:", err);
        setCarregando(false);
      });
  }, [arquivoId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4 animate-slideUp">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 m-0">Trilha de Auditoria (Archived)</h3>
            <p className="text-xs text-zinc-500 m-0 truncate max-w-[280px]">Versões anteriores de: {arquivoNome}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 text-lg p-1 cursor-pointer">✕</button>
        </div>

        {carregando ? (
          <p className="text-xs text-zinc-500 text-center py-4">Buscando histórico de versões...</p>
        ) : versoes.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-4">Este arquivo ainda não possui revisões anteriores arquivadas.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {versoes.map((ver) => {
              const nomeVer = ver.arquivo ? ver.arquivo.split('/').pop() : 'Documento';
              const dataFormatada = new Date(ver.criado_em).toLocaleString('pt-BR');
              return (
                <div key={ver.id} className="flex items-center justify-between bg-zinc-50 px-3.5 py-2.5 rounded-xl border border-zinc-200/80 text-xs">
                  <div className="flex flex-col min-w-0 mr-2">
                    <span className="font-semibold text-zinc-800 truncate">{nomeVer}</span>
                    <span className="text-[10px] text-zinc-400">{dataFormatada} • {Math.round((ver.tamanho_bytes || 0) / 1024)} KB</span>
                  </div>
                  <a 
                    href={ver.arquivo} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-3 py-1.5 rounded-lg transition-colors shrink-0"
                  >
                    Baixar
                  </a>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium rounded-lg cursor-pointer transition-colors">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}