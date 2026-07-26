export default function ClientExplorer({ clienteSelecionado, pastas, aoVoltar }) {
  return (
    <div>
      <button 
        className="nav-btn active" 
        style={{ marginBottom: '20px', backgroundColor: '#5e6c84', border: 'none' }} 
        onClick={aoVoltar}
      >
        ← Voltar para Clientes
      </button>

      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ margin: '0 0 5px 0', color: '#172b4d' }}>Projeto de: {clienteSelecionado.nome}</h2>
        <p style={{ margin: 0, color: '#6b778c', fontSize: '14px' }}>Explore as pastas, plantas e versões de arquivos deste cliente.</p>
      </div>

      <h3>Pastas do Projeto</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
        {pastas
          .filter(p => p.cliente === clienteSelecionado.id)
          .map(pasta => (
            <div key={pasta.id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #dfe1e6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '20px', marginRight: '8px' }}>📁</span>
              <strong>{pasta.nome}</strong>
            </div>
          ))}
        {pastas.filter(p => p.cliente === clienteSelecionado.id).length === 0 && (
          <p style={{ color: '#6b778c', fontSize: '14px' }}>Nenhuma pasta cadastrada para este cliente ainda.</p>
        )}
      </div>
    </div>
  );
}