export default function ClientExplorer({ projetoSelecionado, pastas, aoVoltar }) {
  // Filtra as pastas buscando pelo ID do Projeto
  const pastasDoProjeto = pastas.filter(p => p.projeto === projetoSelecionado.id);

  return (
    <div>
      <button 
        className="nav-btn active" 
        style={{ marginBottom: '20px', backgroundColor: '#5e6c84', border: 'none' }} 
        onClick={aoVoltar}
      >
        ← Voltar para Projetos
      </button>

      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ margin: '0 0 5px 0', color: '#172b4d' }}>
          Obra: {projetoSelecionado.nome_projeto || 'Projeto sem título'}
        </h2>
        <p style={{ margin: 0, color: '#6b778c', fontSize: '14px' }}>
          Explore as pastas, plantas e arquivos desta obra.
        </p>
      </div>

      <h3>Pastas da Obra</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
        {pastasDoProjeto.map(pasta => (
          <div 
            key={pasta.id} 
            style={{ 
              backgroundColor: '#fff', 
              padding: '15px', 
              borderRadius: '8px', 
              border: '1px solid #dfe1e6', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              transition: 'box-shadow 0.2s' 
            }} 
            onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'} 
            onMouseOut={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'}
          >
            {/* Ícone SVG de Pasta */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <strong style={{ color: '#172b4d', fontSize: '14px' }}>{pasta.nome}</strong>
          </div>
        ))}
        
        {pastasDoProjeto.length === 0 && (
          <p style={{ color: '#6b778c', fontSize: '14px', gridColumn: '1 / -1' }}>
            Nenhuma pasta foi criada para esta obra ainda.
          </p>
        )}
      </div>
    </div>
  );
}