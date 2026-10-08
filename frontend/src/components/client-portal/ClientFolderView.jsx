import { useState } from 'react';
import ApprovalStatusBadge from '../common/ApprovalStatusBadge';
import {
  getFileUrl as helperGetFileUrl,
  formatarNomeArquivo as helperFormatName,
  resolverArquivosVersaoRecente,
} from '../client-explorer/fileUtils';

export default function ClientFolderView({
  projeto,
  pastas = [],
  arquivos = [],
  onVoltarProjetos,
  onVoltar,
  onCliqueArquivo,
  getFileUrl = helperGetFileUrl,
  formatarNomeArquivo = helperFormatName,
}) {
  const [pastaAtivaId, setPastaAtivaId] = useState('todas');
  const handleVoltar = onVoltarProjetos || onVoltar;

  if (!projeto) return null;

  // Lógica de 'Latest Version Resolution' para garantir que apenas a versão mais recente apareça
  const arquivosResolvidos = resolverArquivosVersaoRecente(arquivos);

  // Filtragem dos arquivos pela pasta selecionada nas abas
  const arquivosExibidos =
    pastaAtivaId === 'todas'
      ? arquivosResolvidos
      : arquivosResolvidos.filter((a) => {
          const pId = typeof a.pasta === 'object' ? a.pasta?.id : a.pasta;
          return String(pId) === String(pastaAtivaId);
        });

  return (
    <div className="min-h-screen w-full bg-slate-50 p-6 sm:p-8 pb-32 font-sans animate-fadeIn flex flex-col items-center">
      <div className="w-full max-w-5xl">
        {/* BOTÃO VOLTAR */}
        {handleVoltar && (
          <button
            type="button"
            onClick={handleVoltar}
            className="mb-6 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors shadow-sm cursor-pointer flex items-center gap-2 active:scale-95"
            title="Voltar à lista de projetos"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5"></path>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Voltar aos Meus Projetos</span>
          </button>
        )}

        {/* CABEÇALHO DO PROJETO */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {projeto.nome_projeto}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {projeto.rua || 'Endereço não informado'}
            </p>
          </div>
          <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-center self-start sm:self-auto">
            <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5">
              Status da Obra
            </span>
            <span className="font-bold text-indigo-700">
              {projeto.fase_atual || 'Em andamento'}
            </span>
          </div>
        </div>

        {/* ABAS DE NAVEGAÇÃO DE PASTAS (SE HOUVER PASTAS VISÍVEIS) */}
        {pastas.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              <button
                type="button"
                onClick={() => setPastaAtivaId('todas')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  pastaAtivaId === 'todas'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Todos os Documentos ({arquivosResolvidos.length})
              </button>

              {pastas.map((pasta) => {
                const qtdNoFolder = arquivosResolvidos.filter((a) => {
                  const pId = typeof a.pasta === 'object' ? a.pasta?.id : a.pasta;
                  return String(pId) === String(pasta.id);
                }).length;

                return (
                  <button
                    key={pasta.id}
                    type="button"
                    onClick={() => setPastaAtivaId(String(pasta.id))}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                      String(pastaAtivaId) === String(pasta.id)
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>{pasta.nome}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        String(pastaAtivaId) === String(pasta.id)
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {qtdNoFolder}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TÍTULO DA SEÇÃO & CONTADOR */}
        <div className="flex flex-col gap-1 mb-4 md:flex-row md:items-center md:justify-between px-1">
          <h3 className="text-lg font-bold text-slate-900">Documentos & Plantas da Obra</h3>
          <span className="text-xs text-slate-500 font-medium">
            {arquivosExibidos.length} documento{arquivosExibidos.length === 1 ? '' : 's'} disponível{arquivosExibidos.length === 1 ? '' : 'is'}
          </span>
        </div>

        {/* GRELHA DE ARQUIVOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {arquivosExibidos.map((arq) => {
            const nome = arq.nome || formatarNomeArquivo(arq.arquivo);
            const totalFeedbacks = arq.feedbacks?.length || 0;

            return (
              <div
                key={arq.id}
                onClick={() => onCliqueArquivo && onCliqueArquivo(arq)}
                className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between shadow-xs hover:shadow-md hover:border-indigo-300 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="13 2 13 9 20 9"></polyline>
                      </svg>
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-slate-900 truncate m-0" title={nome}>
                        {nome}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400 m-0 mt-0.5">
                        Clique para analisar
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <ApprovalStatusBadge status={arq.status_aprovacao} size="sm" />
                    {totalFeedbacks > 0 && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium flex items-center gap-1 border border-slate-200">
                        💬 {totalFeedbacks}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onCliqueArquivo && onCliqueArquivo(arq)}
                      className="px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    >
                      Avaliar
                    </button>
                    <a
                      href={getFileUrl(arq.arquivo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                      title="Baixar Arquivo"
                      aria-label="Baixar Arquivo"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}

          {/* ESTADO VAZIO */}
          {arquivosExibidos.length === 0 && (
            <div className="col-span-full py-12 px-6 flex flex-col items-center justify-center text-center bg-white border border-dashed border-slate-300 rounded-3xl">
              <div className="p-4 bg-slate-50 rounded-full mb-3">
                <svg className="w-8 h-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-900 mb-1">Nenhum documento disponível</p>
              <p className="text-xs text-slate-500">
                {pastaAtivaId !== 'todas'
                  ? 'Esta pasta ainda não possui arquivos liberados para visualização.'
                  : 'Seu arquiteto ainda não liberou arquivos para visualização nesta obra.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

