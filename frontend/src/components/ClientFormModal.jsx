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
  const [buscandoCep, setBuscandoCep] = useState(false);

  useEffect(() => {
    if (projetoParaEditar) {
      let cepCarregado = projetoParaEditar.cep ? projetoParaEditar.cep.replace(/\D/g, '') : '';
      if (cepCarregado.length > 5) cepCarregado = cepCarregado.replace(/(\d{5})(\d+)/, '$1-$2');

      setFormProjeto({
        ...projetoParaEditar,
        cep: cepCarregado
      });

      const clienteId = typeof projetoParaEditar.cliente === 'object' ? projetoParaEditar.cliente?.id : projetoParaEditar.cliente;
      setClienteSelecionadoId(clienteId || ''); 
      setModoCliente('existente'); 
    } else {
      setFormProjeto(estadoInicialProjeto);
      setFormCliente(estadoInicialCliente);
      setClienteSelecionadoId('');
    }
  }, [projetoParaEditar]);

  const buscarCep = async (cepValor) => {
    const cepLimpo = cepValor.replace(/\D/g, ''); 
    if (cepLimpo.length === 8) {
      setBuscandoCep(true);
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
      } finally {
        setBuscandoCep(false);
      }
    }
  };

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
  const clientesAtivos = clientesExistentes.filter(c => !c.arquivado);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-xl p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-slideUp">
        
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-100">
          <h3 className="text-lg font-semibold text-zinc-900 m-0">
            {isEdicao ? 'Editar Projeto / Obra' : 'Cadastrar Novo Projeto'}
          </h3>
          <button 
            type="button" 
            onClick={aoFechar} 
            className="text-zinc-400 hover:text-zinc-900 text-lg transition-colors p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* SEÇÃO CLIENTE */}
          <div className="bg-zinc-50 border border-zinc-200/80 p-4 rounded-xl space-y-3.5">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider m-0">Dados do Cliente</h4>
              
              {!isEdicao && (
                <div className="flex gap-4">
                  <label className="text-xs font-medium text-zinc-700 cursor-pointer flex items-center gap-1.5">
                    <input type="radio" checked={modoCliente === 'existente'} onChange={() => setModoCliente('existente')} className="accent-indigo-600" />
                    Existente
                  </label>
                  <label className="text-xs font-medium text-zinc-700 cursor-pointer flex items-center gap-1.5">
                    <input type="radio" checked={modoCliente === 'novo'} onChange={() => setModoCliente('novo')} className="accent-indigo-600" />
                    Novo
                  </label>
                </div>
              )}
            </div>

            {modoCliente === 'existente' ? (
              <div>
                <select 
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer" 
                  value={clienteSelecionadoId} 
                  onChange={e => setClienteSelecionadoId(e.target.value)} 
                  required 
                  disabled={isEdicao}
                >
                  <option value="">Selecione um cliente da lista...</option>
                  {clientesAtivos.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <input 
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                      placeholder="Nome Completo *" 
                      required={modoCliente === 'novo'} 
                      value={formCliente.nome} 
                      onChange={e => setFormCliente({ ...formCliente, nome: e.target.value })} 
                    />
                  </div>
                  <div>
                    <input 
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                      placeholder="URL da Foto" 
                      value={formCliente.foto} 
                      onChange={e => setFormCliente({ ...formCliente, foto: e.target.value })} 
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="w-16">
                    <input className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 text-center" placeholder="DDI" value={formCliente.ddi} onChange={e => setFormCliente({ ...formCliente, ddi: e.target.value })} />
                  </div>
                  <div className="w-20">
                    <input className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 text-center" placeholder="DDD" value={formCliente.ddd} onChange={handleDDDChange} />
                  </div>
                  <div className="flex-1">
                    <input className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400" placeholder="Número de Telefone" value={formCliente.telefone} onChange={handleTelefoneChange} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SEÇÃO OBRA */}
          <div className="bg-zinc-50 border border-zinc-200/80 p-4 rounded-xl space-y-4">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4 block">Dados da Obra</h4>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Título do Projeto</label>
              <input 
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                placeholder="Ex: Residência Alphaville" 
                required 
                value={formProjeto.nome_projeto || ''} 
                onChange={e => setFormProjeto({ ...formProjeto, nome_projeto: e.target.value })} 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tipo / Escopo</label>
                <select 
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer" 
                  value={formProjeto.tipo_projeto || ''} 
                  onChange={e => setFormProjeto({ ...formProjeto, tipo_projeto: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  <option value="Arquitetura Hospitalar">Arquitetura Hospitalar</option>
                  <option value="Arquitetura Residencial">Arquitetura Residencial</option>
                  <option value="Interiores">Arquitetura Institucional</option>
                  <option value="Interiores">Interiores</option>
                  <option value="Comercial">Comercial</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Fase Atual</label>
                <select 
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer" 
                  value={formProjeto.fase_atual || ''} 
                  onChange={e => setFormProjeto({ ...formProjeto, fase_atual: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  <option value="Briefing">Briefing</option>
                  <option value="Estudo Preliminar">Estudo Preliminar</option>
                  <option value="Anteprojeto">Anteprojeto</option>
                  <option value="Projeto Executivo">Projeto Executivo</option>
                  <option value="Acompanhamento de Obra">Acompanhamento de Obra</option>
                </select>
              </div>
            </div>

            {/* ENDEREÇO E CEP */}
            <div className="grid grid-cols-6 gap-3">
              <div className="col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">CEP</label>
                <input 
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                  placeholder="00000-000" 
                  value={formProjeto.cep || ''} 
                  onChange={handleCepChange} 
                  onBlur={e => buscarCep(e.target.value)} 
                />
              </div>
              <div className="col-span-3 space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Rua {buscandoCep && <span className="text-indigo-600 font-normal italic">Buscando...</span>}
                </label>
                <input 
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                  value={formProjeto.rua || ''} 
                  onChange={e => setFormProjeto({ ...formProjeto, rua: e.target.value })} 
                />
              </div>
              <div className="col-span-1 space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Nº</label>
                <input 
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                  value={formProjeto.numero || ''} 
                  onChange={e => setFormProjeto({ ...formProjeto, numero: e.target.value })} 
                />
              </div>
            </div>

            {formProjeto.rua && !buscandoCep && (
              <div className="text-[11px] text-emerald-600 font-medium">
                ✓ Endereço preenchido automaticamente via CEP
              </div>
            )}

            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-5 space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Bairro</label>
                <input className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={formProjeto.bairro || ''} onChange={e => setFormProjeto({ ...formProjeto, bairro: e.target.value })} />
              </div>
              <div className="col-span-5 space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cidade</label>
                <input className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={formProjeto.cidade || ''} onChange={e => setFormProjeto({ ...formProjeto, cidade: e.target.value })} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">UF</label>
                <input className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 text-center uppercase" maxLength={2} value={formProjeto.uf || ''} onChange={e => setFormProjeto({ ...formProjeto, uf: e.target.value.toUpperCase() })} />
              </div>
            </div>
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100">
            <button 
              type="button" 
              onClick={aoFechar} 
              className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all cursor-pointer"
            >
              {isEdicao ? 'Salvar Alterações' : 'Cadastrar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}