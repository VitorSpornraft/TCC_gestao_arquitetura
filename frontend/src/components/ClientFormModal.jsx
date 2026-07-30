import { useState, useEffect } from 'react';

export default function ClientFormModal({ clienteParaEditar, aoSalvar, aoFechar }) {
  const estadoInicial = {
    nome: '', foto: '', nome_projeto: '', tipo_projeto: '', fase_atual: '', 
    ddi: '+55', ddd: '', telefone: '', 
    cep: '', rua: '', numero: '', bairro: '', cidade: '', uf: ''
  };

  const [formData, setFormData] = useState(estadoInicial);

  useEffect(() => {
    if (clienteParaEditar) {
      // Quando abre para editar, força a máscara nos dados que vieram do banco
      let telCarregado = clienteParaEditar.telefone ? clienteParaEditar.telefone.replace(/\D/g, '') : '';
      if (telCarregado.length === 9) telCarregado = telCarregado.replace(/(\d{5})(\d{4})/, '$1-$2');
      else if (telCarregado.length > 4) telCarregado = telCarregado.replace(/(\d{4})(\d+)/, '$1-$2');

      let cepCarregado = clienteParaEditar.cep ? clienteParaEditar.cep.replace(/\D/g, '') : '';
      if (cepCarregado.length > 5) cepCarregado = cepCarregado.replace(/(\d{5})(\d+)/, '$1-$2');

      setFormData({
        ...clienteParaEditar,
        telefone: telCarregado,
        cep: cepCarregado
      });
    } else {
      setFormData(estadoInicial);
    }
  }, [clienteParaEditar]);

  const buscarCep = async (cepValor) => {
    const cepLimpo = cepValor.replace(/\D/g, ''); 
    if (cepLimpo.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev, rua: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const handleDDDChange = (e) => {
    let v = e.target.value.replace(/\D/g, ''); 
    if (v.length > 2) v = v.substring(0, 2);
    setFormData({ ...formData, ddd: v });
  };

  const handleTelefoneChange = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 9) v = v.substring(0, 9);
    
    if (v.length === 9) v = v.replace(/(\d{5})(\d{4})/, '$1-$2');
    else if (v.length > 4) v = v.replace(/(\d{4})(\d+)/, '$1-$2');
    
    setFormData({ ...formData, telefone: v });
  };

  const handleCepChange = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 8) v = v.substring(0, 8);
    if (v.length > 5) v = v.replace(/(\d{5})(\d+)/, '$1-$2');
    setFormData({ ...formData, cep: v });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Tentando enviar estes dados para o Django:", formData);
    aoSalvar(formData);
  };

  const isEdicao = !!clienteParaEditar;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '650px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#172b4d' }}>
            {isEdicao ? 'Editar Projeto / Cliente' : 'Cadastrar Novo Projeto'}
          </h3>
          <button type="button" onClick={aoFechar} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#6b778c' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>Título do Projeto</label>
              <input className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} placeholder="Ex: Clínica Central" required value={formData.nome_projeto || ''} onChange={e => setFormData({ ...formData, nome_projeto: e.target.value })} />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>Nome do Cliente</label>
              <input className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} required value={formData.nome || ''} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>Tipo / Escopo</label>
              <select className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} value={formData.tipo_projeto || ''} onChange={e => setFormData({ ...formData, tipo_projeto: e.target.value })}>
                <option value="">Selecione...</option>
                <option value="Arquitetura Hospitalar">Arquitetura Hospitalar</option>
                <option value="Arquitetura Residencial">Arquitetura Residencial</option>
                <option value="Interiores">Interiores</option>
                <option value="Comercial">Comercial</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>Fase Atual</label>
              <select className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} value={formData.fase_atual || ''} onChange={e => setFormData({ ...formData, fase_atual: e.target.value })}>
                <option value="">Selecione...</option>
                <option value="Briefing">Briefing</option>
                <option value="Estudo Preliminar">Estudo Preliminar</option>
                <option value="Anteprojeto">Anteprojeto</option>
                <option value="Projeto Executivo">Projeto Executivo</option>
                <option value="Acompanhamento de Obra">Acompanhamento de Obra</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ width: '70px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>DDI</label>
              <input className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} placeholder="+55" value={formData.ddi || ''} onChange={e => setFormData({ ...formData, ddi: e.target.value })} />
            </div>
            <div style={{ width: '80px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>DDD</label>
              <input className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} placeholder="Ex: 18" value={formData.ddd || ''} onChange={handleDDDChange} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>Telefone</label>
              <input className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} placeholder="99999-9999" value={formData.telefone || ''} onChange={handleTelefoneChange} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>URL da Foto</label>
              <input className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} value={formData.foto || ''} onChange={e => setFormData({ ...formData, foto: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ width: '120px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>CEP</label>
              <input className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} placeholder="00000-000" value={formData.cep || ''} onChange={handleCepChange} onBlur={e => buscarCep(e.target.value)} title="Digite o CEP e saia do campo" />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>Rua</label>
              <input className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} value={formData.rua || ''} onChange={e => setFormData({ ...formData, rua: e.target.value })} />
            </div>
            <div style={{ width: '80px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>Número</label>
              <input className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} value={formData.numero || ''} onChange={e => setFormData({ ...formData, numero: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>Bairro</label>
              <input className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} value={formData.bairro || ''} onChange={e => setFormData({ ...formData, bairro: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>Cidade</label>
              <input className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} value={formData.cidade || ''} onChange={e => setFormData({ ...formData, cidade: e.target.value })} />
            </div>
            <div style={{ width: '60px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>UF</label>
              <input className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} maxLength={2} value={formData.uf || ''} onChange={e => setFormData({ ...formData, uf: e.target.value.toUpperCase() })} />
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