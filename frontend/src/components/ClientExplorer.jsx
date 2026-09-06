import { useState, useRef } from 'react';
import axios from 'axios';
import LinkTaskModal from './modals/LinkTaskModal';
import ConfirmCommitModal from './modals/ConfirmCommitModal';
import VersionHistoryModal from './modals/VersionHistoryModal';
import ConfirmActionModal from './modals/ConfirmActionModal';

export default function ClientExplorer({ projetoSelecionado, clientes = [], pastas = [], arquivos = [], tarefas = [], aoVoltar, aoAtualizarDados }) {
  const fileInputRef = useRef(null);
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // --- MÁQUINA DE ESTADOS DO FLUXO DE VERSIONAMENTO ---
  const [fluxoVersao, setFluxoVersao] = useState({
    passo: 0,
    tarefaId: '',
    subtarefaId: '',
    marcarChecklist: true,
    arquivoPai: null,
    comentario: ''
  });

  const [gerenciarVersoesDe, setGerenciarVersoesDe] = useState(null);

  // ESTADOS DE HIERARQUIA E MODAIS DE PASTA/ARQUIVO
  const [pastaAtualId, setPastaAtualId] = useState(null);
  const [historicoCaminho, setHistoricoCaminho] = useState([{ id: null, nome: 'Raiz' }]);
  const [modalPastaAberta, setModalPastaAberta] = useState(false);
  const [nomeNovaPasta, setNomeNovaPasta] = useState('');
  const [pastaParaEditar, setPastaParaEditar] = useState(null);
  const [nomeEdicaoPasta, setNomeEdicaoPasta] = useState('');
  const [arquivoVisualizando, setArquivoVisualizando] = useState(null);
  const [confirmacao, setConfirmacao] = useState(null);

  const getFileUrl = (urlPath) => {
    if (!urlPath) return '';
    if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) return urlPath;
    const finalPath = urlPath.startsWith('/media/') ? urlPath : (urlPath.startsWith('/') ? `/media${urlPath}` : `/media/${urlPath}`);
    return `http://127.0.0.1:8000${finalPath}`;
  };

  const formatarNomeArquivo = (urlOuCaminho) => {
    if (!urlOuCaminho) return 'Documento';
    let nomeOriginal = urlOuCaminho.split('/').pop();
    return nomeOriginal.replace(/_[A-Za-z0-9]{6,8}(\.[^.]+)$/, '$1');
  };

  const forcarDownload = async (url, nomeArquivo) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = blobUrl; link.download = nomeArquivo;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) { window.open(url, '_blank'); }
  };

  const acaoCliqueArquivo = (arq) => {
    if (fluxoVersao.passo === 2) {
      setFluxoVersao({ ...fluxoVersao, passo: 3, arquivoPai: arq });
      return;
    }
    const url = getFileUrl(arq.arquivo);
    const ext = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) setArquivoVisualizando(arq);
    else if (['pdf', 'txt', 'md'].includes(ext)) window.open(url, '_blank');
    else forcarDownload(url, formatarNomeArquivo(arq.arquivo));
  };

  const listaPastas = Array.isArray(pastas) ? pastas : [];
  const listaArquivos = Array.isArray(arquivos) ? arquivos : [];
  const listaClientes = Array.isArray(clientes) ? clientes : [];
  const listaTarefas = Array.isArray(tarefas) ? tarefas : [];

  const clienteObj = listaClientes.find(c => c.id === projetoSelecionado?.cliente) || null;
  const telefoneFormatado = clienteObj && clienteObj.telefone 
    ? `${clienteObj.ddi || '+55'} ${clienteObj.ddd ? `(${clienteObj.ddd})` : ''} ${clienteObj.telefone}` : 'Telefone não cadastrado';

  const temEndereco = projetoSelecionado?.rua || projetoSelecionado?.cidade;
  const enderecoFormatado = temEndereco
    ? `${projetoSelecionado.rua || ''}${projetoSelecionado.numero ? `, ${projetoSelecionado.numero}` : ''} - ${projetoSelecionado.bairro || ''}, ${projetoSelecionado.cidade || ''} / ${projetoSelecionado.uf || ''}`
    : 'Endereço não cadastrado';

  const dataCriacaoFormatada = projetoSelecionado?.criado_em 
    ? new Date(projetoSelecionado.criado_em).toLocaleDateString('pt-BR') : 'Data não registrada';

  const pastasFiltradas = listaPastas.filter(p => {
    if (!p) return false;
    const pertenceProjeto = String(p.projeto === 'object' ? p.projeto?.id : p.projeto) === String(projetoSelecionado?.id);
    const paiId = p.pasta_pai !== undefined ? p.pasta_pai : p.parent;
    const noNivel = pastaAtualId === null ? (!paiId || paiId === null) : (String(paiId?.id || paiId) === String(pastaAtualId));
    return pertenceProjeto && noNivel;
  });

  const arquivosFiltrados = listaArquivos.filter(a => {
    if (!a) return false;
    const pertenceProjeto = String(a.projeto === 'object' ? a.projeto?.id : a.projeto) === String(projetoSelecionado?.id);
    const pastaArquivoId = a.pasta !== undefined ? a.pasta : null;
    const naPasta = pastaAtualId === null ? (!pastaArquivoId || pastaArquivoId === null) : (String(pastaArquivoId?.id || pastaArquivoId) === String(pastaAtualId));
    return pertenceProjeto && naPasta && !a.versao_de;
  });

  const tarefasDaObra = listaTarefas.filter(t => String(t.projeto === 'object' ? t.projeto?.id : t.projeto) === String(projetoSelecionado?.id));
  const tarefaSelecionadaObj = tarefasDaObra.find(t => String(t.id) === String(fluxoVersao.tarefaId));

  const entrarNaPasta = (pasta) => { setPastaAtualId(pasta.id); setHistoricoCaminho([...historicoCaminho, { id: pasta.id, nome: pasta.nome }]); };
  const voltarParaNivel = (idx) => { const novo = historicoCaminho.slice(0, idx + 1); setHistoricoCaminho(novo); setPastaAtualId(novo[novo.length - 1].id); };

  const criarNovaPasta = async (e) => {
    e.preventDefault();
    if (pastasFiltradas.some(p => p.nome.trim().toLowerCase() === nomeNovaPasta.trim().toLowerCase())) return alert(`Pasta já existe.`);
    try {
      await axios.post('http://127.0.0.1:8000/api/pastas/', { nome: nomeNovaPasta.trim(), projeto: projetoSelecionado.id, pasta_pai: pastaAtualId });
      setNomeNovaPasta(''); setModalPastaAberta(false); if (aoAtualizarDados) aoAtualizarDados();
    } catch (e) { alert("Falha ao criar pasta."); }
  };

  const salvarEdicaoPasta = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`http://127.0.0.1:8000/api/pastas/${pastaParaEditar.id}/`, { nome: nomeEdicaoPasta.trim() });
      setPastaParaEditar(null); setNomeEdicaoPasta(''); if (aoAtualizarDados) aoAtualizarDados();
    } catch (e) { alert("Falha ao renomear."); }
  };

  const deletarPasta = (e, pastaId, pastaNome) => {
    e.stopPropagation();
    setConfirmacao({
      titulo: "Excluir pasta",
      mensagem: `Deseja excluir a pasta "${pastaNome}"?`,
      textoConfirmar: "Excluir",
      variante: "perigo",
      aoConfirmar: async () => {
        try { await axios.delete(`http://127.0.0.1:8000/api/pastas/${pastaId}/`); if (aoAtualizarDados) aoAtualizarDados(); } catch (e) {}
      },
    });
  };

  const deletarArquivo = (e, arquivoId, arquivoNome) => {
    e.stopPropagation();
    setConfirmacao({
      titulo: "Excluir arquivo",
      mensagem: `Deseja excluir o arquivo "${arquivoNome}"?`,
      textoConfirmar: "Excluir",
      variante: "perigo",
      aoConfirmar: async () => {
        try {
          await axios.delete(`http://127.0.0.1:8000/api/arquivos/${arquivoId}/`);
          if (aoAtualizarDados) aoAtualizarDados();
          if (arquivoVisualizando?.id === arquivoId) setArquivoVisualizando(null);
        } catch (e) {}
      },
    });
  };

  const aoEscolherArquivo = (e) => { if (e.target.files?.length) setArquivoSelecionado(e.target.files[0]); };
  const cancelarUpload = () => { setArquivoSelecionado(null); setFluxoVersao({ passo: 0, tarefaId: '', subtarefaId: '', marcarChecklist: true, arquivoPai: null, comentario: '' }); };

  const fazerUploadECommit = async (ehNovaVersao) => {
    if (!arquivoSelecionado) return;
    const formData = new FormData();
    formData.append('arquivo', arquivoSelecionado);
    formData.append('projeto', projetoSelecionado.id);
    if (pastaAtualId !== null) formData.append('pasta', pastaAtualId);
    
    let nomeOriginal = arquivoSelecionado.name.split('.'); nomeOriginal.pop();
    formData.append('nome', nomeOriginal.join('.'));

    if (ehNovaVersao && fluxoVersao.arquivoPai) {
      formData.append('versao_de', fluxoVersao.arquivoPai.id);
      if (fluxoVersao.tarefaId) formData.append('tarefa', fluxoVersao.tarefaId);
      if (fluxoVersao.comentario) formData.append('comentario', fluxoVersao.comentario);
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/arquivos/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (ehNovaVersao && fluxoVersao.subtarefaId && fluxoVersao.marcarChecklist) {
        await axios.patch(`http://127.0.0.1:8000/api/subtarefas/${fluxoVersao.subtarefaId}/`, { concluida: true });
      }
      alert(ehNovaVersao ? 'Nova versão vinculada com sucesso!' : 'Arquivo salvo com sucesso!');
      cancelarUpload(); if (aoAtualizarDados) aoAtualizarDados();
    } catch (error) { alert('Falha ao enviar o documento.'); }
  };

  if (!projetoSelecionado) return null;

  return (
    <div className="pb-12 font-sans bg-slate-50 min-h-screen p-6 -m-6 relative">
      <button onClick={aoVoltar} className="mb-8 px-5 py-2.5 flex items-center gap-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer shadow-xs">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path></svg> Voltar para Obras
      </button>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-8 mb-8 shadow-xs">
        <div className="border-b border-slate-100 pb-5 mb-6">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2 mt-0">{projetoSelecionado.nome_projeto || 'Projeto sem título'}</h2>
          <p className="text-sm text-slate-500 m-0 mb-3.5">Visão geral e arquivos vinculados a esta obra.</p>
          {clienteObj && (
            <div className="inline-flex items-center gap-2 bg-indigo-50/70 border border-indigo-100 px-3.5 py-1.5 rounded-xl text-sm font-medium text-indigo-900">
              <svg className="w-4 h-4 text-indigo-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span><span className="font-semibold text-indigo-950">{clienteObj.nome}</span><span className="text-indigo-400 mx-1.5">—</span><span className="text-indigo-700">{telefoneFormatado}</span></span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div><span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Endereço da Obra</span><span className="text-sm font-medium text-slate-900">{enderecoFormatado}</span></div>
          <div><span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fase Atual</span><span className="inline-block px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded-md text-xs font-semibold text-indigo-700">{projetoSelecionado.fase_atual || 'Não definida'}</span></div>
          <div><span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tipo</span><span className="text-sm font-medium text-slate-900">{projetoSelecionado.tipo_projeto || 'Não definido'}</span></div>
          <div><span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cadastrado em</span><span className="text-sm font-medium text-slate-900">{dataCriacaoFormatada}</span></div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">Upload de Documentos</h3>
      
      {!arquivoSelecionado ? (
        <div onDragOver={e => {e.preventDefault(); setIsDragging(true);}} onDragLeave={() => setIsDragging(false)} onDrop={e => {e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files?.length) setArquivoSelecionado(e.dataTransfer.files[0]);}} className={`border-2 border-dashed rounded-2xl p-6 mb-6 transition-all flex flex-col sm:flex-row items-center justify-between gap-6 bg-white ${isDragging ? 'border-indigo-400 bg-indigo-50/50 scale-[1.01]' : 'border-slate-200 hover:border-slate-300'}`}>
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100"><svg className="text-indigo-600" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg></div>
            <div><p className="text-sm font-semibold text-slate-900 m-0 mb-0.5">Arraste arquivos para esta pasta</p><p className="text-xs text-slate-500 m-0">Plantas (PDF, DWG), memoriais ou imagens.</p></div>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" onChange={aoEscolherArquivo} />
          <button onClick={() => fileInputRef.current.click()} className="bg-indigo-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer">Procurar Arquivo</button>
        </div>
      ) : fluxoVersao.passo === 0 ? (
        <div className="mb-8 px-5 py-4 bg-white border border-slate-200 rounded-xl shadow-lg animate-fadeIn flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg></div>
            <div><span className="font-bold text-slate-900 block">{arquivoSelecionado.name}</span><span className="text-xs text-slate-500">Arquivo selecionado</span></div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={cancelarUpload} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">Cancelar</button>
            <button onClick={() => fazerUploadECommit(false)} className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg shadow-sm cursor-pointer transition-colors">Salvar como Novo</button>
            <button onClick={() => setFluxoVersao({ ...fluxoVersao, passo: 1 })} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md cursor-pointer transition-colors flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg> Adicionar como Versão
            </button>
          </div>
        </div>
      ) : null}

      {fluxoVersao.passo === 2 && (
        <div className="sticky top-4 z-40 mb-6 bg-indigo-600 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between animate-slideDown">
          <div className="flex items-center gap-3"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 font-bold">2</span><div><p className="font-bold m-0 text-base">Selecione o Arquivo Original</p><p className="text-indigo-100 text-xs m-0">Navegue pelas pastas abaixo e clique no arquivo que receberá a versão nova.</p></div></div>
          <button onClick={cancelarUpload} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium cursor-pointer transition-colors">Cancelar</button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 mt-8">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs">
          <svg className="w-4 h-4 text-indigo-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
          {historicoCaminho.map((nivel, idx) => (
            <div key={nivel.id || 'raiz'} className="flex items-center gap-2">
              {idx > 0 && <span className="text-slate-300">/</span>}
              <button onClick={() => voltarParaNivel(idx)} className={`hover:text-indigo-600 transition-colors cursor-pointer ${idx === historicoCaminho.length - 1 ? 'font-bold text-slate-900 pointer-events-none' : ''}`}>{nivel.nome}</button>
            </div>
          ))}
        </div>
        <button onClick={() => setModalPastaAberta(true)} disabled={fluxoVersao.passo === 2} className="disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors cursor-pointer flex items-center gap-1.5">+ Nova Pasta</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {pastasFiltradas.map(pasta => (
          <div key={pasta.id} onClick={() => entrarNaPasta(pasta)} className="p-4 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 cursor-pointer shadow-xs hover:border-indigo-300 hover:shadow-md transition-all group relative">
            <div className="flex items-center gap-3.5 overflow-hidden">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg></div>
              <div className="overflow-hidden"><strong className="text-sm font-semibold text-slate-900 block truncate group-hover:text-indigo-600 transition-colors">{pasta.nome}</strong><span className="text-xs text-slate-400">Pasta</span></div>
            </div>
            {fluxoVersao.passo !== 2 && (
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity bg-white/95 p-1 rounded-lg border border-slate-100 shadow-xs shrink-0">
                <button type="button" onClick={(e) => {e.stopPropagation(); setPastaParaEditar(pasta); setNomeEdicaoPasta(pasta.nome);}} className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-md transition-colors"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                <button type="button" onClick={(e) => deletarPasta(e, pasta.id, pasta.nome)} className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-md transition-colors"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
              </div>
            )}
          </div>
        ))}

        {arquivosFiltrados.map(arq => {
          const url = getFileUrl(arq.arquivo);
          const ext = url.split('.').pop()?.toLowerCase();
          const nomeExibicao = formatarNomeArquivo(arq.arquivo);
          const isSelecaoMode = fluxoVersao.passo === 2;
          const qtdVersoes = listaArquivos.filter(a => String(a.versao_de === 'object' ? a.versao_de?.id : a.versao_de) === String(arq.id)).length;

          return (
            <div key={arq.id} onClick={() => acaoCliqueArquivo(arq)} className={`p-4 bg-white border rounded-2xl flex items-center justify-between gap-3 shadow-xs transition-all cursor-pointer group relative ${isSelecaoMode ? 'border-indigo-300 hover:bg-indigo-50 ring-2 ring-transparent hover:ring-indigo-400' : 'border-slate-200/90 hover:border-indigo-300 hover:shadow-md'}`}>
              <div className="flex items-center gap-3.5 overflow-hidden">
                <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${isSelecaoMode ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg></div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-medium text-slate-900 block truncate group-hover:text-indigo-600 transition-colors" title={nomeExibicao}>{nomeExibicao}</strong>
                    {qtdVersoes > 0 && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200">v{qtdVersoes + 1}</span>}
                  </div>
                  <span className="text-xs text-slate-400">{isSelecaoMode ? 'Clique para substituir' : 'Clique para exibir'}</span>
                </div>
              </div>
              {!isSelecaoMode && (
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity bg-white/95 p-1 rounded-lg border border-slate-100 shadow-xs shrink-0">
                  <button type="button" onClick={(e) => {e.stopPropagation(); setGerenciarVersoesDe(arq);}} className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 p-1.5 rounded-md transition-colors"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></button>
                  <button type="button" onClick={(e) => deletarArquivo(e, arq.id, nomeExibicao)} className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-md transition-colors"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </div>
              )}
            </div>
          );
        })}

        {pastasFiltradas.length === 0 && arquivosFiltrados.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
            <p className="text-sm text-slate-500 m-0">Esta pasta está vazia. Crie uma nova pasta ou envie arquivos acima.</p>
          </div>
        )}
      </div>

      {/* --- IMPORTAÇÃO DOS MODAIS --- */}
      <LinkTaskModal fluxoVersao={fluxoVersao} setFluxoVersao={setFluxoVersao} tarefasDaObra={tarefasDaObra} tarefaSelecionadaObj={tarefaSelecionadaObj} cancelarUpload={cancelarUpload} />
      <ConfirmCommitModal fluxoVersao={fluxoVersao} setFluxoVersao={setFluxoVersao} arquivoSelecionado={arquivoSelecionado} formatarNomeArquivo={formatarNomeArquivo} cancelarUpload={cancelarUpload} fazerUploadECommit={fazerUploadECommit} />
      <VersionHistoryModal gerenciarVersoesDe={gerenciarVersoesDe} setGerenciarVersoesDe={setGerenciarVersoesDe} listaArquivos={listaArquivos} formatarNomeArquivo={formatarNomeArquivo} getFileUrl={getFileUrl} forcarDownload={forcarDownload} />

      {/* MODAL VISUALIZAÇÃO E CRIAR/EDITAR PASTA (MANTIDOS INLINE PELA SIMPLICIDADE) */}
      {arquivoVisualizando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="overflow-hidden pr-4"><h3 className="text-sm font-bold text-slate-900 truncate m-0">{formatarNomeArquivo(arquivoVisualizando.arquivo)}</h3><span className="text-xs text-slate-500">Visualização de Imagem</span></div>
              <div className="flex items-center gap-3 shrink-0"><button onClick={() => forcarDownload(getFileUrl(arquivoVisualizando.arquivo), formatarNomeArquivo(arquivoVisualizando.arquivo))} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>Baixar Imagem</button><button onClick={() => setArquivoVisualizando(null)} className="text-slate-400 hover:text-slate-900 text-base transition-colors cursor-pointer p-1">✕</button></div>
            </div>
            <div className="flex-1 bg-slate-900/5 flex items-center justify-center p-4 overflow-auto"><img src={getFileUrl(arquivoVisualizando.arquivo)} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg shadow-md bg-white" /></div>
          </div>
        </div>
      )}

      {modalPastaAberta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100"><h3 className="text-base font-semibold text-slate-900 m-0">Criar Nova Pasta</h3><button onClick={() => setModalPastaAberta(false)} className="text-slate-400 hover:text-slate-900 text-base cursor-pointer">✕</button></div>
            <form onSubmit={criarNovaPasta} className="space-y-4">
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nome da Pasta</label><input type="text" autoFocus className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20" value={nomeNovaPasta} onChange={e => setNomeNovaPasta(e.target.value)} required /></div>
              <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setModalPastaAberta(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl cursor-pointer">Cancelar</button><button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm cursor-pointer">Criar Pasta</button></div>
            </form>
          </div>
        </div>
      )}

      {pastaParaEditar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100"><h3 className="text-base font-semibold text-slate-900 m-0">Renomear Pasta</h3><button onClick={() => setPastaParaEditar(null)} className="text-slate-400 hover:text-slate-900 text-base cursor-pointer">✕</button></div>
            <form onSubmit={salvarEdicaoPasta} className="space-y-4">
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Novo Nome</label><input type="text" autoFocus className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20" value={nomeEdicaoPasta} onChange={e => setNomeEdicaoPasta(e.target.value)} required /></div>
              <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setPastaParaEditar(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl cursor-pointer">Cancelar</button><button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm cursor-pointer">Salvar</button></div>
            </form>
          </div>
        </div>
      )}
      {confirmacao && (
        <ConfirmActionModal
          titulo={confirmacao.titulo}
          mensagem={confirmacao.mensagem}
          textoConfirmar={confirmacao.textoConfirmar}
          variante={confirmacao.variante}
          onFechar={() => setConfirmacao(null)}
          onConfirmar={() => {
            confirmacao.aoConfirmar();
            setConfirmacao(null);
          }}
        />
      )}
    </div>
  );
}
