export default function ClientExplorer({ projetoSelecionado, pastas, aoVoltar }) {
  // Filtra as pastas buscando pelo ID do Projeto
  const pastasDoProjeto = pastas.filter(p => p.projeto === projetoSelecionado.id);

  // Helper para formatar o endereço
  const temEndereco = projetoSelecionado.rua || projetoSelecionado.cidade;
  const enderecoFormatado = temEndereco
    ? `${projetoSelecionado.rua || ''}${projetoSelecionado.numero ? `, ${projetoSelecionado.numero}` : ''} - ${projetoSelecionado.bairro || ''}, ${projetoSelecionado.cidade || ''} / ${projetoSelecionado.uf || ''}`
    : 'Endereço não cadastrado';

  // Helper para formatar a data de criação do Django para o padrão brasileiro
  const dataCriacaoFormatada = projetoSelecionado.criado_em 
    ? new Date(projetoSelecionado.criado_em).toLocaleDateString('pt-BR') 
    : 'Data não registrada';

  return (
    <div>
      {/* BOTÃO VOLTAR */}
      <button 
        className="nav-btn active" 
        style={{ marginBottom: '24px', padding: '8px 16px', display: 'inline-block' }} 
        onClick={aoVoltar}
      >
        ← Voltar para Obras
      </button>

      {/* FICHA DA OBRA (Context Header) */}
      <div className="kanban-card" style={{ marginBottom: '32px', cursor: 'default' }}>
        <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontSize: '22px' }}>
              {projetoSelecionado.nome_projeto || 'Projeto sem título'}
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
              Visão geral e arquivos vinculados a esta obra.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
          {/* Coluna 1: Endereço */}
          <div>
            <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Endereço da Obra
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>
              {enderecoFormatado}
            </span>
            {projetoSelecionado.cep && (
              <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                CEP: {projetoSelecionado.cep}
              </span>
            )}
          </div>

          {/* Coluna 2: Fase */}
          <div>
            <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Fase Atual
            </span>
            <span style={{ display: 'inline-block', padding: '4px 8px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: '500', color: 'var(--text-main)' }}>
              {projetoSelecionado.fase_atual || 'Não definida'}
            </span>
          </div>

          {/* Coluna 3: Tipo */}
          <div>
            <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Tipo de Projeto
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500' }}>
              {projetoSelecionado.tipo_projeto || 'Não definido'}
            </span>
          </div>

          {/* Coluna 4: Data de Criação (Novo) */}
          <div>
            <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Cadastrado em
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500' }}>
              {dataCriacaoFormatada}
            </span>
          </div>
        </div>
      </div>

      {/* ÁREA DE PASTAS E ARQUIVOS */}
      <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--text-main)' }}>Pastas do Projeto</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {pastasDoProjeto.map(pasta => (
          <div 
            key={pasta.id} 
            className="kanban-card" 
            style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <strong style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: '500' }}>{pasta.nome}</strong>
          </div>
        ))}
        
        {pastasDoProjeto.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '30px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', border: '1px dashed var(--border-light)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
              Nenhuma pasta localizada para esta obra no momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}