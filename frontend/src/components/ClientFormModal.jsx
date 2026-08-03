import { useState, useEffect } from 'react';

export default function ClientFormModal({ projetoParaEditar, clientesExistentes = [], aoSalvarProjeto, aoCriarClienteNovo, aoFechar }) {
  
  const estadoInicialProjeto = {
    nome_projeto: '', tipo_projeto: '', fase_atual: '', 
    cep: '', rua: '', numero: '', bairro: '', cidade: '', uf: ''
  };

  const estadoInicialCliente = {
    nome: '', foto: '', ddi: '+55', ddd: '', telefone: ''
  };

  const [formProjeto, setFormProjeto] = useState(estadoInicialProjeto);
  const [formCliente, setFormCliente] = useState(estadoInicialCliente);

  const [modoCliente, setModoCliente] = useState('existente'); 
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState('');

  useEffect(() => {
    if (projetoParaEditar) {
      let cepCarregado = projetoParaEditar.cep ? projetoParaEditar.cep.replace(/\D/g, '') : '';
      if (cepCarregado.length > 5) cepCarregado = cepCarregado.replace(/(\d{5})(\d+)/, '$1-$2');

      setFormProjeto({
        ...projetoParaEditar,
        cep: cepCarregado
      });

      setClienteSelecionadoId(projetoParaEditar.cliente); 
      setModoCliente('existente'); 
    } else {
      setFormProjeto(estadoInicialProjeto);
      setFormCliente(estadoInicialCliente);
    }
  }, [projetoParaEditar]);

  const buscarCep = async (cepValor) => {
    const cepLimpo = cepValor.replace(/\D/g, ''); 
    if (cepLimpo.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormProjeto(prev => ({
            ...prev, rua: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  // --- MÁSCARAS ---
  const handleDDDChange = (e) => {
    let v = e.target.value.replace(/\D/g, ''); 
    if (v.length > 2) v = v.substring(0, 2);
    setFormCliente({ ...formCliente, ddd: v });
  };

  const handleTelefoneChange = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 9) v = v.substring(0, 9);
    
    if (v.length === 9) v = v.replace(/(\d{5})(\d{4})/, '$1-$2');
    else if (v.length > 4) v = v.replace(/(\d{4})(\d+)/, '$1-$2');
    
    setFormCliente({ ...formCliente, telefone: v });
  };

  const handleCepChange = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 8) v = v.substring(0, 8);
    if (v.length > 5) v = v.replace(/(\d{5})(\d+)/, '$1-$2');
    setFormProjeto({ ...formProjeto, cep: v });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let idDoClienteFinal = clienteSelecionadoId;

    if (modoCliente === 'novo') {
      const clienteCriado = await aoCriarClienteNovo(formCliente);
      if (clienteCriado && clienteCriado.id) {
        idDoClienteFinal = clienteCriado.id;
      } else {
        alert("Erro ao criar o novo cliente. Verifique a conexão.");
        return; 
      }
    }

    if (!idDoClienteFinal) {
      alert("Por favor, selecione um cliente ou crie um novo.");
      return;
    }

    const dadosParaSalvar = {
      ...formProjeto,
      cliente: idDoClienteFinal
    };

    aoSalvarProjeto(dadosParaSalvar);
  };

  const isEdicao = !!projetoParaEditar;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#172b4d' }}>
            {isEdicao ? 'Editar Projeto' : 'Cadastrar Novo Projeto'}
          </h3>
          <button type="button" onClick={aoFechar} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#6b778c' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div style={{ backgroundColor: '#f4f5f7', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, color: '#172b4d', fontSize: '14px' }}>Dados do Cliente</h4>
              
              {!isEdicao && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label style={{ fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="radio" checked={modoCliente === 'existente'} onChange={() => setModoCliente('existente')} />
                    Cliente Existente
                  </label>
                  <label style={{ fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="radio" checked={modoCliente === 'novo'} onChange={() => setModoCliente('novo')} />
                    Novo Cliente
                  </label>
                </div>
              )}
            </div>

            {modoCliente === 'existente' ? (
              <div>
                <select className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} value={clienteSelecionadoId} onChange={e => setClienteSelecionadoId(e.target.value)} required disabled={isEdicao}>
                  <option value="">Selecione um cliente da lista...</option>
                  {clientesExistentes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
            ) : (
              // Campos para criar NOVO CLIENTE
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 2 }}>
                    <input className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="Nome Completo *" required={modoCliente === 'novo'} value={formCliente.nome} onChange={e => setFormCliente({ ...formCliente, nome: e.target.value })} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="URL da Foto" value={formCliente.foto} onChange={e => setFormCliente({ ...formCliente, foto: e.target.value })} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ width: '70px' }}>
                    <input className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="DDI" value={formCliente.ddi} onChange={e => setFormCliente({ ...formCliente, ddi: e.target.value })} />
                  </div>
                  <div style={{ width: '80px' }}>
                    <input className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="DDD" value={formCliente.ddd} onChange={handleDDDChange} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="Telefone" value={formCliente.telefone} onChange={handleTelefoneChange} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <h4 style={{ margin: '0 0 15px 0', color: '#172b4d', fontSize: '14px' }}>Dados da Obra</h4>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>Título do Projeto</label>
              <input className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} placeholder="Ex: Clínica Central" required value={formProjeto.nome_projeto || ''} onChange={e => setFormProjeto({ ...formProjeto, nome_projeto: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>Tipo / Escopo</label>
              <select className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} value={formProjeto.tipo_projeto || ''} onChange={e => setFormProjeto({ ...formProjeto, tipo_projeto: e.target.value })}>
                <option value="">Selecione...</option>
                <option value="Arquitetura Hospitalar">Arquitetura Hospitalar</option>
                <option value="Arquitetura Residencial">Arquitetura Residencial</option>
                <option value="Interiores">Interiores</option>
                <option value="Comercial">Comercial</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>Fase Atual</label>
              <select className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} value={formProjeto.fase_atual || ''} onChange={e => setFormProjeto({ ...formProjeto, fase_atual: e.target.value })}>
                <option value="">Selecione...</option>
                <option value="Briefing">Briefing</option>
                <option value="Estudo Preliminar">Estudo Preliminar</option>
                <option value="Anteprojeto">Anteprojeto</option>
                <option value="Projeto Executivo">Projeto Executivo</option>
                <option value="Acompanhamento de Obra">Acompanhamento de Obra</option>
              </select>
            </div>
          </div>

          {/* ENDEREÇO DA OBRA */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ width: '120px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>CEP da Obra</label>
              <input className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} placeholder="00000-000" value={formProjeto.cep || ''} onChange={handleCepChange} onBlur={e => buscarCep(e.target.value)} />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>Rua</label>
              <input className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} value={formProjeto.rua || ''} onChange={e => setFormProjeto({ ...formProjeto, rua: e.target.value })} />
            </div>
            <div style={{ width: '80px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>Número</label>
              <input className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} value={formProjeto.numero || ''} onChange={e => setFormProjeto({ ...formProjeto, numero: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>Bairro</label>
              <input className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} value={formProjeto.bairro || ''} onChange={e => setFormProjeto({ ...formProjeto, bairro: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>Cidade</label>
              <input className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} value={formProjeto.cidade || ''} onChange={e => setFormProjeto({ ...formProjeto, cidade: e.target.value })} />
            </div>
            <div style={{ width: '60px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>UF</label>
              <input className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} maxLength={2} value={formProjeto.uf || ''} onChange={e => setFormProjeto({ ...formProjeto, uf: e.target.value.toUpperCase() })} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={aoFechar} style={{ padding: '10px 15px', backgroundColor: '#ebecf0', color: '#42526e', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancelar</button>
            <button type="submit" className="btn-primary">
              {isEdicao ? 'Salvar Alterações' : 'Cadastrar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}