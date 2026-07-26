export default function Navbar({ telaAtual, setTelaAtual, setClienteSelecionado }) {
  return (
    <div className="nav-bar">
      <h2 style={{ margin: 0, fontSize: '18px' }}>Gestão Arquitetônica TCC</h2>
      <div className="nav-buttons">
        <button 
          className={`nav-btn ${telaAtual === 'kanban' ? 'active' : ''}`} 
          onClick={() => setTelaAtual('kanban')}
        >
          Quadro Kanban
        </button>
        <button 
          className={`nav-btn ${telaAtual === 'clientes' || telaAtual === 'explorador' ? 'active' : ''}`} 
          onClick={() => { setTelaAtual('clientes'); setClienteSelecionado(null); }}
        >
          Clientes & Arquivos
        </button>
      </div>
    </div>
  );
}