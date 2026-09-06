import { useState } from 'react';

export default function ClientList({ projetos, clientes, aoSelecionarProjeto, aoDeletarProjeto, aoEditarProjeto, aoRestaurarProjeto }) {
  const [abaFiltro, setAbaFiltro] = useState('ativos'); 
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  // Filtro integrado de abas, busca e tipo de projeto
  const projetosFiltrados = projetos.filter(p => {
    const matchAba = abaFiltro === 'ativos' ? !p.arquivado : p.arquivado;
    
    const termo = busca.toLowerCase();
    const clienteObj = clientes ? clientes.find(c => c.id === p.cliente) : null;
    
    const matchNomeProjeto = (p.nome_projeto || '').toLowerCase().includes(termo);
    const matchCliente = clienteObj ? (clienteObj.nome || '').toLowerCase().includes(termo) : false;
    const matchTipo = filtroTipo ? p.tipo_projeto === filtroTipo : true;

    return matchAba && (matchNomeProjeto || matchCliente) && matchTipo;
  });

  // Extrai dinamicamente os tipos de projeto para o filtro
  const tiposProjeto = [...new Set(projetos.map(p => p.tipo_projeto).filter(Boolean))];

  return (
    <div className="w-full space-y-6">
      {/* BARRA SUPERIOR: ABAS, PESQUISA E FILTRAGEM */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-zinc-200 pb-4">
        <div className="flex gap-2">
          <button 
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              abaFiltro === 'ativos' 
                ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-2xs' 
                : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
            onClick={() => setAbaFiltro('ativos')}
          >
            Obras Ativas ({projetos.filter(p => !p.arquivado).length})
          </button>
          <button 
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              abaFiltro === 'arquivados' 
                ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-2xs' 
                : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
            onClick={() => setAbaFiltro('arquivados')}
          >
            Arquivados ({projetos.filter(p => p.arquivado).length})
          </button>
        </div>

        {/* CAMPO DE PESQUISA E ÍCONE/SELETOR DE FILTRAGEM */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center w-full md:w-72">
            <svg className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="Pesquisar obra ou cliente..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>

          {/* FILTRO POR TIPO DE PROJETO */}
          <div className="relative">
            <select
              className="bg-white border border-zinc-200 text-zinc-700 text-sm rounded-xl px-3 py-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
              title="Filtrar por tipo de projeto"
            >
              <option value="">Filtrar tipo...</option>
              {tiposProjeto.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* LISTAGEM DE CARDS */}
      {projetosFiltrados.length === 0 ? (
        <div className="text-center py-12 px-4 text-zinc-400 bg-white rounded-2xl border border-zinc-200/80 shadow-xs">
          <p className="text-sm font-medium text-zinc-600">Nenhuma obra encontrada.</p>
          {abaFiltro === 'ativos' && <p className="text-xs text-zinc-400 mt-1.5">Tente alterar os termos de busca ou clique em "+ Nova Obra".</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {projetosFiltrados.map(projeto => {
            const clienteObj = clientes ? clientes.find(c => c.id === projeto.cliente) : null;
            
            // Formatação limpa do telefone do cliente
            const telefoneFormatado = clienteObj && clienteObj.telefone 
              ? `${clienteObj.ddi || '+55'} ${clienteObj.ddd ? `(${clienteObj.ddd})` : ''} ${clienteObj.telefone}`
              : null;

            return (
              <div 
                key={projeto.id} 
                className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col relative group cursor-pointer"
                onClick={() => aoSelecionarProjeto(projeto)}
              >
                {/* BOTÕES DE AÇÃO (Aparecem apenas ao passar o mouse) */}
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 bg-white/90 backdrop-blur-xs p-1 rounded-lg border border-zinc-100 shadow-sm">
                  
                  {abaFiltro === 'arquivados' && (
                    <button
                      type="button"
                      className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 p-1.5 rounded-md transition-colors"
                      title="Restaurar Obra"
                      onClick={(e) => {
                        e.stopPropagation();
                        aoRestaurarProjeto(projeto.id, projeto.nome_projeto);
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 14 4 9 9 4"></polyline>
                        <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                      </svg>
                    </button>
                  )}

                  <button
                    type="button"
                    className="text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-md transition-colors"
                    title="Editar Obra"
                    onClick={(e) => {
                      e.stopPropagation();
                      aoEditarProjeto(projeto);
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-md transition-colors"
                    title="Excluir Obra"
                    onClick={(e) => {
                      e.stopPropagation();
                      aoDeletarProjeto(projeto.id, projeto.nome_projeto);
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>

                {/* CONTEÚDO DO CARD */}
                <div className="flex flex-col h-full justify-between space-y-4">
                  {/* INFORMAÇÕES DO CLIENTE E OBRA */}
                  <div className="flex items-start gap-3.5 pr-12">
                    {clienteObj?.foto ? (
                      <img 
                        src={clienteObj.foto} 
                        alt={clienteObj.nome} 
                        className="w-11 h-11 rounded-full object-cover border border-zinc-200 shrink-0 shadow-2xs" 
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-2xs">
                        {clienteObj && clienteObj.nome ? clienteObj.nome.charAt(0).toUpperCase() : 'O'}
                      </div>
                    )}
                    
                    <div className="overflow-hidden space-y-0.5">
                      <strong className="block text-zinc-900 text-sm font-semibold truncate leading-snug">
                        {projeto.nome_projeto || 'Obra sem nome'}
                      </strong>
                      <span className="text-xs text-zinc-500 font-medium truncate block">
                        {clienteObj ? clienteObj.nome : 'Cliente não vinculado'}
                      </span>
                      {telefoneFormatado && (
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-normal pt-0.5">
                          <svg className="w-3 h-3 text-zinc-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                          </svg>
                          {telefoneFormatado}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* RODAPÉ DO CARD (FASE DESTAQUE E TIPO) */}
                  <div className="border-t border-zinc-100 pt-3.5 flex justify-between items-center text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Fase Atual</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-100/60 shadow-2xs">
                        {projeto.fase_atual || 'Não definida'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-right">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Tipo</span>
                      <span className="text-zinc-700 font-medium">{projeto.tipo_projeto || 'Não definido'}</span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}