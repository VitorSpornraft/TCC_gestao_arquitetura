import { useState } from 'react';

export default function ClientList({ clientes, aoCriarCliente, aoSelecionarCliente }) {
  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    email: '',
    telefone: '',
    foto: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    aoCriarCliente(novoCliente);
    setNovoCliente({ nome: '', email: '', telefone: '', foto: '' });
  };

  return (
    <div>
      <h2 style={{ color: '#172b4d', marginBottom: '20px' }}>Gestão de Clientes</h2>
      
      <form className="card-form" onSubmit={handleSubmit}>
        <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>Cadastrar Novo Cliente</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <input 
            className="form-input" style={{ flex: 2, minWidth: '200px' }} placeholder="Nome Completo" required
            value={novoCliente.nome} onChange={e => setNovoCliente({...novoCliente, nome: e.target.value})} 
          />
          <input 
            className="form-input" style={{ flex: 2, minWidth: '200px' }} placeholder="E-mail" type="email" required
            value={novoCliente.email} onChange={e => setNovoCliente({...novoCliente, email: e.target.value})} 
          />
          <input 
            className="form-input" style={{ flex: 1, minWidth: '150px' }} placeholder="Telefone" required
            value={novoCliente.telefone} onChange={e => setNovoCliente({...novoCliente, telefone: e.target.value})} 
          />
          <input 
            className="form-input" style={{ flex: 2, minWidth: '200px' }} placeholder="URL da Foto (Opcional)"
            value={novoCliente.foto} onChange={e => setNovoCliente({...novoCliente, foto: e.target.value})} 
          />
          <button className="btn-primary" type="submit">Salvar Cliente</button>
        </div>
      </form>

      <div className="clients-grid">
        {clientes.map(c => (
          <div 
            key={c.id} 
            className="client-card"
            onClick={() => aoSelecionarCliente(c)}
          >
            {c.foto ? (
              <img src={c.foto} alt={c.nome} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#0052cc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                {c.nome.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#172b4d' }}>{c.nome}</h4>
              <p style={{ margin: '0 0 3px 0', fontSize: '13px', color: '#5e6c84' }}>{c.email}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#8993a4' }}>Tel: {c.telefone}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}