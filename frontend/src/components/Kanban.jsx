import { useState } from 'react';

export default function Kanban({
  tarefas,
  projetos,
  clientes,
  busca,
  setBusca,
  aoCriarTarefa,
  aoDeletarTarefa,
  aoMoverTarefa,
  aoAdicionarSubtarefa,
  aoToggleSubtarefa,
  aoDeletarSubtarefa,
  tarefaModal,
  setTarefaModal,
  aoSalvarEdicaoModal
}) {
  const [novaTarefa, setNovaTarefa] = useState({
    titulo: '',
    projeto: '',
    categoria: '',
    prazo: '',
    status: 'REALIZAR'
  });

  const [novaSubtarefaText, setNovaSubtarefaText] = useState({});

  const handleCriar = (e) => {
    e.preventDefault();
    aoCriarTarefa(novaTarefa);
    setNovaTarefa({ titulo: '', projeto: '', categoria: '', prazo: '', status: 'REALIZAR' });
  };

  // --- BLINDAGEM CONTRA VALORES NULOS NO BANCO DE DADOS ---
  const tarefasFiltradas = tarefas.filter(t => {
    const termoBusca = (busca || '').toLowerCase();

    const tituloSeguro = (t.titulo || '').toLowerCase();
    const categoriaSegura = (t.categoria || '').toLowerCase();

    const matchTitulo = tituloSeguro.includes(termoBusca);
    const matchCategoria = categoriaSegura.includes(termoBusca);

    // Busca pelo nome do Projeto e do Cliente
    const projetoObj = projetos.find(p => p.id === t.projeto);
    const matchProjeto = projetoObj ? (projetoObj.nome_projeto || '').toLowerCase().includes(termoBusca) : false;

    const clienteObj = projetoObj ? clientes.find(c => c.id === projetoObj.cliente) : null;
    const matchCliente = clienteObj ? (clienteObj.nome || '').toLowerCase().includes(termoBusca) : false;

    return matchTitulo || matchCategoria || matchProjeto || matchCliente;
  });

  const tarefasRealizar = tarefasFiltradas.filter(t => (t.status || '').toUpperCase() === 'REALIZAR');
  const tarefasRealizando = tarefasFiltradas.filter(t => (t.status || '').toUpperCase() === 'REALIZANDO');
  const tarefasRealizado = tarefasFiltradas.filter(t => (t.status || '').toUpperCase() === 'REALIZADO');

  const colunasConfig = [
    { titulo: 'Realizar', statusKey: 'REALIZAR', lista: tarefasRealizar },
    { titulo: 'Realizando', statusKey: 'REALIZANDO', lista: tarefasRealizando },
    { titulo: 'Realizado', statusKey: 'REALIZADO', lista: tarefasRealizado }
  ];

  return (
    <>
      <form className="card-form" onSubmit={handleCriar}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>Nova Tarefa</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <input 
            className="form-input" style={{ flex: 2, minWidth: '200px' }} placeholder="Título da tarefa" required
            value={novaTarefa.titulo} onChange={e => setNovaTarefa({...novaTarefa, titulo: e.target.value})} 
          />
          
          <select className="form-input" style={{ flex: 1, minWidth: '150px' }} required value={novaTarefa.projeto} onChange={e => setNovaTarefa({...novaTarefa, projeto: e.target.value})}>
            <option value="">Selecione a Obra...</option>
            {projetos.map(p => (
              <option key={p.id} value={p.id}>{p.nome_projeto || `Projeto #${p.id}`}</option>
            ))}
          </select>
          
          <input 
            className="form-input" style={{ flex: 1, minWidth: '130px' }} placeholder="Categoria (ex: 3D, Planta)" required
            value={novaTarefa.categoria} onChange={e => setNovaTarefa({...novaTarefa, categoria: e.target.value})} 
          />
          <input 
            type="date" className="form-input" style={{ width: '150px' }} required
            value={novaTarefa.prazo} onChange={e => setNovaTarefa({...novaTarefa, prazo: e.target.value})} 
          />
          <button className="btn-primary" type="submit">Adicionar Tarefa</button>
        </div>
      </form>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '25px', width: '100%', maxWidth: '400px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}>
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          className="form-input"
          style={{ width: '100%', paddingLeft: '38px', marginBottom: 0, backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} 
          placeholder="Pesquisar por título, categoria, obra ou cliente..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      <div className="kanban-board">
        {colunasConfig.map((col, idx) => (
          <div 
            key={idx} 
            className="kanban-column"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const tarefaId = e.dataTransfer.getData('tarefaId');
              if (tarefaId) aoMoverTarefa(tarefaId, col.statusKey);
            }}
          >
            <h3 style={{ color: '#42526e', fontSize: '16px', marginTop: 0, marginBottom: '15px', flexShrink: 0 }}>
              {col.titulo} ({col.lista.length})
            </h3>
            <div className="cards-container">
              {col.lista.map(t => {
                
                const projetoObj = projetos.find(p => p.id === t.projeto);
                const clienteObj = projetoObj ? clientes.find(c => c.id === projetoObj.cliente) : null;
                
                return (
                  <div 
                    key={t.id} 
                    className="kanban-card"
                    draggable={true}
                    onDragStart={(e) => e.dataTransfer.setData('tarefaId', t.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #f0f2f5' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {clienteObj?.foto ? (
                          <img src={clienteObj.foto} alt={clienteObj.nome} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#0052cc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                            {projetoObj && projetoObj.nome_projeto ? projetoObj.nome_projeto.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#5e6c84', textTransform: 'uppercase', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={projetoObj ? projetoObj.nome_projeto : ''}>
                          {projetoObj ? (projetoObj.nome_projeto || 'Sem Título') : 'Obra Apagada'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <svg 
                          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                          style={{ cursor: 'pointer', transition: 'stroke 0.2s' }} 
                          title="Editar Tarefa & Checklist"
                          onClick={() => setTarefaModal(t)}
                          onMouseOver={(e) => e.currentTarget.style.stroke = '#0052cc'}
                          onMouseOut={(e) => e.currentTarget.style.stroke = '#5e6c84'}
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>

                        <svg 
                          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#de350b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                          style={{ cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.2s' }} 
                          title="Excluir Tarefa"
                          onClick={() => aoDeletarTarefa(t.id)}
                          onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </div>
                    </div>

                    <strong style={{ fontSize: '15px', color: '#172b4d', display: 'block', marginBottom: '4px' }}>{t.titulo}</strong>
                    <span style={{ display: 'inline-block', fontSize: '11px', backgroundColor: '#deebff', color: '#0052cc', padding: '2px 6px', borderRadius: '4px', fontWeight: '600', marginBottom: '8px' }}>
                      {t.categoria || 'Sem categoria'}
                    </span>
                    <p style={{ fontSize: '12px', color: '#6b778c', margin: '0 0 10px 0' }}>Prazo: {t.prazo || 'Sem prazo'}</p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5e6c84', fontWeight: '600' }}>
                      <span>Progresso</span>
                      <span>{t.progresso}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div style={{
                        width: `${t.progresso}%`,
                        backgroundColor: t.progresso === 100 ? '#36b37e' : '#0052cc',
                        height: '100%',
                        transition: 'width 0.3s ease-in-out'
                      }}></div>
                    </div>

                    <div style={{ marginTop: '12px', borderTop: '1px solid #f0f2f5', paddingTop: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#5e6c84', textTransform: 'uppercase' }}>Checklist</span>
                      {t.subtarefas && t.subtarefas.map(sub => (
                        <div key={sub.id} className="sub-item" onClick={() => aoToggleSubtarefa(sub)}>
                          <input type="checkbox" checked={sub.concluida} readOnly style={{ cursor: 'pointer' }} />
                          <span style={{ textDecoration: sub.concluida ? 'line-through' : 'none', color: sub.concluida ? '#8f95a3' : '#333' }}>
                            {sub.titulo}
                          </span>
                        </div>
                      ))}

                      <div style={{ display: 'flex', marginTop: '8px', gap: '5px' }}>
                        <input 
                          className="form-input"
                          style={{ flex: 1, padding: '6px', fontSize: '12px', marginBottom: 0 }}
                          placeholder="Adicionar item (Pressione Enter)..."
                          value={novaSubtarefaText[t.id] || ''}
                          onChange={e => setNovaSubtarefaText({ ...novaSubtarefaText, [t.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              aoAdicionarSubtarefa(t.id, novaSubtarefaText[t.id]);
                              setNovaSubtarefaText({ ...novaSubtarefaText, [t.id]: '' });
                            }
                          }}
                        />
                        <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} type="button" onClick={() => {
                          aoAdicionarSubtarefa(t.id, novaSubtarefaText[t.id]);
                          setNovaSubtarefaText({ ...novaSubtarefaText, [t.id]: '' });
                        }}>+</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE EDIÇÃO */}
      {tarefaModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#172b4d' }}>Editar Tarefa & Checklist</h3>
              <button onClick={() => setTarefaModal(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#6b778c' }}>✕</button>
            </div>

            <form onSubmit={aoSalvarEdicaoModal}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>Título</label>
                <input className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} value={tarefaModal.titulo || ''} onChange={e => setTarefaModal({ ...tarefaModal, titulo: e.target.value })} required />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>Obra / Projeto</label>
                  <select className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} value={tarefaModal.projeto || ''} onChange={e => setTarefaModal({ ...tarefaModal, projeto: e.target.value })} required>
                    {projetos.map(p => <option key={p.id} value={p.id}>{p.nome_projeto || `Projeto #${p.id}`}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>Categoria</label>
                  <input className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} value={tarefaModal.categoria || ''} onChange={e => setTarefaModal({ ...tarefaModal, categoria: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>Prazo</label>
                  <input type="date" className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} value={tarefaModal.prazo || ''} onChange={e => setTarefaModal({ ...tarefaModal, prazo: e.target.value })} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '5px' }}>Status</label>
                  <select className="form-input" style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }} value={tarefaModal.status || 'REALIZAR'} onChange={e => setTarefaModal({ ...tarefaModal, status: e.target.value })}>
                    <option value="REALIZAR">Realizar</option>
                    <option value="REALIZANDO">Realizando</option>
                    <option value="REALIZADO">Realizado</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '25px', backgroundColor: '#f4f5f7', padding: '15px', borderRadius: '8px', border: '1px solid #dfe1e6' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e6c84', marginBottom: '10px', textTransform: 'uppercase' }}>Itens do Checklist</label>
                {tarefaModal.subtarefas && tarefaModal.subtarefas.map(sub => (
                  <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', backgroundColor: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e1e4e8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" checked={sub.concluida} onChange={() => aoToggleSubtarefa(sub, tarefaModal.id)} style={{ cursor: 'pointer' }} />
                      <span style={{ fontSize: '13px', textDecoration: sub.concluida ? 'line-through' : 'none', color: sub.concluida ? '#8f95a3' : '#333' }}>{sub.titulo}</span>
                    </div>
                    <button type="button" onClick={() => aoDeletarSubtarefa(sub.id, tarefaModal.id)} style={{ background: 'none', border: 'none', color: '#de350b', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Excluir</button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setTarefaModal(null)} style={{ padding: '10px 15px', backgroundColor: '#ebecf0', color: '#42526e', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}