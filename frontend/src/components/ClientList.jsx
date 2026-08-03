import { useState } from 'react';

export default function ClientList({ projetos, clientes, aoSelecionarProjeto, aoDeletarProjeto, aoEditarProjeto, aoRestaurarProjeto }) {
  // 1. Estado para controlar qual aba está ativa
  const [abaFiltro, setAbaFiltro] = useState('ativos'); 

  // 2. Filtro dos projetos com base na aba escolhida
  const projetosFiltrados = projetos.filter(p => abaFiltro === 'ativos' ? !p.arquivado : p.arquivado);
  
  return (
    <div>
      {/* 3. ABAS DE NAVEGAÇÃO (Ativos vs Arquivados) */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
        <button 
          className={`nav-btn ${abaFiltro === 'ativos' ? 'active' : ''}`} 
          onClick={() => setAbaFiltro('ativos')}
        >
          Obras Ativas ({projetos.filter(p => !p.arquivado).length})
        </button>
        <button 
          className={`nav-btn ${abaFiltro === 'arquivados' ? 'active' : ''}`} 
          onClick={() => setAbaFiltro('arquivados')}
        >
          Arquivados ({projetos.filter(p => p.arquivado).length})
        </button>
      </div>

      {/* Se não houver projetos na aba atual, mostra a mensagem */}
      {projetosFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: `1px solid var(--border-light)` }}>
          <p>Nenhuma obra encontrada nesta categoria.</p>
          {abaFiltro === 'ativos' && <p style={{ fontSize: '14px', marginTop: '8px' }}>Clique em "+ Nova Obra" para começar.</p>}
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '24px' 
        }}>
          {projetosFiltrados.map(projeto => {
            // BLINDAGEM: Tenta achar o cliente. Se não achar, não quebra o sistema!
            const clienteObj = clientes ? clientes.find(c => c.id === projeto.cliente) : null;

            return (
              <div 
                key={projeto.id} 
                className="kanban-card" 
                style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}
              >
                {/* BOTÕES DE AÇÃO (Lápis e Lixeira) */}
                <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '12px', zIndex: 10 }}>


                  {/* Ícone de Restaurar (SÓ APARECE NOS ARQUIVADOS) */}
                  {abaFiltro === 'arquivados' && (
                    <svg 
                      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                      style={{ cursor: 'pointer', transition: 'stroke 0.2s' }} 
                      title="Restaurar Obra"
                      onClick={(e) => {
                        e.stopPropagation();
                        aoRestaurarProjeto(projeto.id, projeto.nome_projeto);
                      }}
                      onMouseOver={(e) => e.currentTarget.style.stroke = '#15803d'}
                      onMouseOut={(e) => e.currentTarget.style.stroke = '#16a34a'}
                    >
                      <polyline points="9 14 4 9 9 4"></polyline>
                      <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                    </svg>
                  )}

                  {/* Ícone de Editar */}
                  <svg 
                    width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                    style={{ cursor: 'pointer', transition: 'stroke 0.2s' }} 
                    title="Editar Obra"
                    onClick={(e) => {
                      e.stopPropagation(); // Impede o clique de vazar pro Card inteiro
                      aoEditarProjeto(projeto);
                    }}
                    onMouseOver={(e) => e.currentTarget.style.stroke = '#18181b'}
                    onMouseOut={(e) => e.currentTarget.style.stroke = '#71717a'}
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>

                  {/* Ícone de Excluir */}
                  <svg 
                    width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                    style={{ cursor: 'pointer', transition: 'stroke 0.2s' }} 
                    title="Excluir Obra"
                    onClick={(e) => {
                      e.stopPropagation(); // Impede o clique de vazar pro Card inteiro
                      aoDeletarProjeto(projeto.id, projeto.nome_projeto);
                      alert(`Tem certeza que deseja excluir: ${projeto.nome_projeto}?`);
                    }}
                    onMouseOver={(e) => e.currentTarget.style.stroke = '#b91c1c'}
                    onMouseOut={(e) => e.currentTarget.style.stroke = '#ef4444'}
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </div>

                {/* Área Clicável (Abre as pastas da obra) */}
                <div 
                  style={{ cursor: 'pointer', flex: 1 }}
                  onClick={() => aoSelecionarProjeto(projeto)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', paddingRight: '40px' }}>
                    
                    {/* Foto ou Inicial do Cliente */}
                    {clienteObj?.foto ? (
                      <img 
                        src={clienteObj.foto} 
                        alt={clienteObj.nome} 
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-light)' }} 
                      />
                    ) : (
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '50%', 
                        backgroundColor: 'var(--primary)', 
                        color: '#fff', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '18px',
                        fontWeight: '600',
                        flexShrink: 0
                      }}>
                        {clienteObj && clienteObj.nome ? clienteObj.nome.charAt(0).toUpperCase() : 'O'}
                      </div>
                    )}
                    
                    {/* Textos da Obra */}
                    <div style={{ overflow: 'hidden' }}>
                      <strong style={{ 
                        display: 'block', 
                        color: 'var(--text-main)', 
                        fontSize: '16px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {projeto.nome_projeto || 'Obra sem nome'}
                      </strong>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {clienteObj ? clienteObj.nome : 'Cliente não vinculado'}
                      </span>
                    </div>
                  </div>

                  {/* Informações Extras */}
                  <div style={{ 
                    fontSize: '13px', 
                    color: 'var(--text-muted)', 
                    borderTop: '1px solid var(--border-light)', 
                    paddingTop: '16px',
                    marginTop: 'auto',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Fase Atual</span>
                      <span style={{ color: 'var(--text-main)' }}>{projeto.fase_atual || 'Não definida'}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Tipo</span>
                      <span style={{ color: 'var(--text-main)' }}>{projeto.tipo_projeto || 'Não definido'}</span>
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