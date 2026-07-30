import { useState } from 'react';
import ClientFormModal from './ClientFormModal';

export default function ClientList({ clientes, tarefas, aoCriarCliente, aoSelecionarCliente, aoEditarCliente, aoArquivarCliente }) {
  const [mostrarArquivados, setMostrarArquivados] = useState(false); 
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);

  const clientesFiltrados = clientes.filter(c => !!c.arquivado === mostrarArquivados);

  const handleSalvarModal = (dados) => {
    if (clienteEditando) aoEditarCliente(dados.id, dados);
    else aoCriarCliente(dados);
    setModalAberto(false);
    setClienteEditando(null);
  };

  const abrirModalNovo = () => {
    setClienteEditando(null);
    setModalAberto(true);
  };

  const abrirModalEditar = (cliente, e) => {
    e.stopPropagation();
    setClienteEditando(cliente);
    setModalAberto(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#172b4d', margin: 0, fontSize: '22px' }}>
          Gestão de Projetos {mostrarArquivados ? 'Arquivados' : 'Ativos'}
        </h2>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {!mostrarArquivados && (
            <button className="btn-primary" onClick={abrirModalNovo} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', fontSize: '13px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Novo Projeto
            </button>
          )}

          <button 
            className="nav-btn active"
            style={{ backgroundColor: mostrarArquivados ? '#5e6c84' : '#ebecf0', color: mostrarArquivados ? '#fff' : '#42526e', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', fontSize: '13px' }}
            onClick={() => setMostrarArquivados(!mostrarArquivados)}
          >
            {mostrarArquivados ? (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Voltar</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="5" rx="2" ry="2"></rect><path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"></path><path d="M10 13h4"></path></svg> Arquivados</>
            )}
          </button>
        </div>
      </div>
      
      {clientesFiltrados.length === 0 && (
        <p style={{ color: '#6b778c', fontSize: '14px', textAlign: 'center', marginTop: '40px' }}>
          Nenhum projeto {mostrarArquivados ? 'arquivado' : 'ativo'} no momento.
        </p>
      )}

      {/* GRID DE CARDS COM DESIGN COMPRIMIDO */}
      <div className="clients-grid" style={{ gap: '15px' }}>
        {clientesFiltrados.map(c => {
          const tarefasDoCliente = tarefas.filter(t => t.cliente === c.id);
          let progressoGeral = 0;
          if (tarefasDoCliente.length > 0) {
            const soma = tarefasDoCliente.reduce((acc, t) => acc + (t.progresso || 0), 0);
            progressoGeral = Math.round(soma / tarefasDoCliente.length);
          }

          return (
            <div 
              key={c.id} 
              className="client-card" 
              onClick={() => aoSelecionarCliente(c)} 
              // CARD MAIS COMPACTO
              style={{ flexDirection: 'column', alignItems: 'stretch', padding: '12px 16px', minHeight: 'auto' }}
            >
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  
                  {/* AVATAR MENOR (40px) */}
                  {c.foto ? (
                    <img src={c.foto} alt={c.nome} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: '#0052cc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', flexShrink: 0 }}>
                      {c.nome_projeto ? c.nome_projeto.charAt(0).toUpperCase() : c.nome.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div>
                    {/* FONTES MENORES E COM MENOS MARGEM */}
                    <h3 style={{ margin: '0 0 2px 0', color: '#172b4d', fontSize: '15px' }}>{c.nome_projeto || 'Projeto sem título'}</h3>
                    <h4 style={{ margin: '0 0 6px 0', color: '#5e6c84', fontSize: '12px', fontWeight: '500' }}>{c.nome}</h4>
                    
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      {c.tipo_projeto && (
                        <span style={{ fontSize: '9px', backgroundColor: '#e6fcff', color: '#006644', padding: '2px 5px', borderRadius: '3px', fontWeight: 'bold', border: '1px solid #79f2c0' }}>{c.tipo_projeto}</span>
                      )}
                      {c.fase_atual && (
                        <span style={{ fontSize: '9px', backgroundColor: '#deebff', color: '#0747a6', padding: '2px 5px', borderRadius: '3px', fontWeight: 'bold', border: '1px solid #b3d4ff' }}>{c.fase_atual}</span>
                      )}
                    </div>
                    
                    <p style={{ margin: 0, fontSize: '10px', color: '#8993a4' }}>
                      {c.ddd ? `${c.ddi} (${c.ddd}) ${c.telefone}` : 'Sem contato'} 
                      {c.cidade && c.uf ? ` • ${c.cidade}, ${c.uf}` : ''}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer', transition: 'stroke 0.2s' }} onClick={(e) => abrirModalEditar(c, e)} onMouseOver={(e) => e.currentTarget.style.stroke = '#0052cc'} onMouseOut={(e) => e.currentTarget.style.stroke = '#5e6c84'}>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#de350b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.2s' }} 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      const msg = mostrarArquivados ? "Deseja restaurar este projeto?" : "Deseja arquivar este projeto?";
                      if (window.confirm(msg)) { aoArquivarCliente(c.id, c.arquivado); } 
                    }} 
                    onMouseOver={(e) => e.currentTarget.style.opacity = '1'} onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
                  >
                    {mostrarArquivados ? (<><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></>) : (<><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></>)}
                  </svg>
                </div>
              </div>

              {/* PROGRESSO MAIS PERTO DO TEXTO */}
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#5e6c84', fontWeight: '600', marginBottom: '4px' }}>
                  <span>Progresso do Projeto</span>
                  <span>{progressoGeral}%</span>
                </div>
                <div className="progress-bar-bg" style={{ height: '6px', backgroundColor: '#ebecf0', borderRadius: '3px' }}>
                  <div style={{ width: `${progressoGeral}%`, backgroundColor: progressoGeral === 100 ? '#36b37e' : '#0052cc', height: '100%', borderRadius: '3px', transition: 'width 0.5s ease-in-out' }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalAberto && (
        <ClientFormModal 
          clienteParaEditar={clienteEditando} 
          aoSalvar={handleSalvarModal} 
          aoFechar={() => {
            setModalAberto(false);
            setClienteEditando(null);
          }} 
        />
      )}
    </div>
  );
}