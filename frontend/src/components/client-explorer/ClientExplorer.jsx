import { useState, useRef } from "react";
import api, { atualizarVisibilidadeArquivo, atualizarVisibilidadePasta } from "../../api";
import LinkTaskModal from "../modals/LinkTaskModal";
import ConfirmCommitModal from "../modals/ConfirmCommitModal";
import VersionHistoryModal from "../modals/VersionHistoryModal";
import ConfirmActionModal from "../modals/ConfirmActionModal";
import {
  forcarDownload,
  formatarNomeArquivo,
  getFileUrl,
  isArquivoPdf,
  isArquivoImagem,
  resolverArquivosVersaoRecente,
} from "./fileUtils";
import ImagePreviewModal from "./ImagePreviewModal";
import FolderModal from "./FolderModal";
import FolderBreadcrumb from "./FolderBreadcrumb";
import ProjectOverviewCard from "./ProjectOverviewCard";
import FileDropzone from "./FileDropzone";
import FolderCard from "./FolderCard";
import FileCard from "./FileCard";
import { useFileDragAndDrop, MoveFileModal } from "./dnd";

export default function ClientExplorer({
  projetoSelecionado,
  clientes = [],
  pastas = [],
  arquivos = [],
  tarefas = [],
  aoVoltar,
  aoAtualizarDados,
}) {
  const fileInputRef = useRef(null);
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Hook de Drag & Drop para mover arquivos entre pastas
  const {
    arquivoArrastando,
    pastaDestinoHover,
    confirmacaoMover,
    estaMovendo,
    erroMover,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    cancelarMover,
    executarMover,
  } = useFileDragAndDrop({ aoAtualizarDados });

  // --- MÁQUINA DE ESTADOS DO FLUXO DE VERSIONAMENTO ---
  const [fluxoVersao, setFluxoVersao] = useState({
    passo: 0,
    tarefaId: "",
    subtarefaId: "",
    marcarChecklist: true,
    arquivoPai: null,
    comentario: "",
  });

  const [gerenciarVersoesDe, setGerenciarVersoesDe] = useState(null);

  // ESTADOS DE HIERARQUIA E MODAIS DE PASTA/ARQUIVO
  const [pastaAtualId, setPastaAtualId] = useState(null);
  const [historicoCaminho, setHistoricoCaminho] = useState([
    { id: null, nome: "Raiz" },
  ]);
  const [modalPastaAberta, setModalPastaAberta] = useState(false);
  const [nomeNovaPasta, setNomeNovaPasta] = useState("");
  const [pastaParaEditar, setPastaParaEditar] = useState(null);
  const [nomeEdicaoPasta, setNomeEdicaoPasta] = useState("");
  const [arquivoVisualizando, setArquivoVisualizando] = useState(null);
  const [confirmacao, setConfirmacao] = useState(null);
  const [mostrarPin, setMostrarPin] = useState(false);

  const acaoCliqueArquivo = (arq) => {
    if (fluxoVersao.passo === 2) {
      setFluxoVersao({ ...fluxoVersao, passo: 3, arquivoPai: arq });
      return;
    }

    setArquivoVisualizando(arq);
  };

  // --- FUNÇÕES DE VISIBILIDADE DO CLIENTE ---
  const toggleVisibilidadeArquivo = async (e, arq) => {
    e.stopPropagation();
    try {
      await atualizarVisibilidadeArquivo(arq.id, !arq.visivel_cliente);
      if (aoAtualizarDados) {
        await aoAtualizarDados();
      }
    } catch (error) {
      console.error("Erro ao atualizar visibilidade do arquivo:", error);
      alert("Falha ao atualizar a visibilidade do arquivo.");
    }
  };

  const toggleVisibilidadePasta = async (e, pasta) => {
    e.stopPropagation();
    try {
      await atualizarVisibilidadePasta(pasta.id, !pasta.visivel_cliente);
      if (aoAtualizarDados) {
        await aoAtualizarDados();
      }
    } catch (error) {
      console.error("Erro ao atualizar visibilidade da pasta:", error);
      alert("Falha ao atualizar a visibilidade da pasta.");
    }
  };

  const listaPastas = Array.isArray(pastas) ? pastas : [];
  const listaArquivos = Array.isArray(arquivos) ? arquivos : [];
  const listaClientes = Array.isArray(clientes) ? clientes : [];
  const listaTarefas = Array.isArray(tarefas) ? tarefas : [];

  const clienteObj =
    listaClientes.find((c) => c.id === projetoSelecionado?.cliente) || null;
  const telefoneFormatado =
    clienteObj && clienteObj.telefone
      ? `${clienteObj.ddi || "+55"} ${clienteObj.ddd ? `(${clienteObj.ddd})` : ""} ${clienteObj.telefone}`
      : "Telefone não cadastrado";

  const temEndereco = projetoSelecionado?.rua || projetoSelecionado?.cidade;
  const enderecoFormatado = temEndereco
    ? `${projetoSelecionado.rua || ""}${projetoSelecionado.numero ? `, ${projetoSelecionado.numero}` : ""} - ${projetoSelecionado.bairro || ""}, ${projetoSelecionado.cidade || ""} / ${projetoSelecionado.uf || ""}`
    : "Endereço não cadastrado";

  const dataCriacaoFormatada = projetoSelecionado?.criado_em
    ? new Date(projetoSelecionado.criado_em).toLocaleDateString("pt-BR")
    : "Data não registrada";

  const pastasFiltradas = listaPastas
    .filter((p) => {
      if (!p) return false;
      const pertenceProjeto =
        String(typeof p.projeto === "object" ? p.projeto?.id : p.projeto) ===
        String(projetoSelecionado?.id);
      const paiId = p.pasta_pai !== undefined ? p.pasta_pai : p.parent;
      const noNivel =
        pastaAtualId === null
          ? !paiId || paiId === null
          : String(paiId?.id || paiId) === String(pastaAtualId);
      return pertenceProjeto && noNivel;
    })
    .sort(
      (a, b) =>
        (a.nome || "").localeCompare(b.nome || "", undefined, {
          sensitivity: "base",
        }) || Number(a.id || 0) - Number(b.id || 0),
    );

  const arquivosDaObra = listaArquivos.filter((a) => {
    if (!a) return false;
    const projId = typeof a.projeto === "object" ? a.projeto?.id : a.projeto;
    return String(projId) === String(projetoSelecionado?.id);
  });

  const arquivosMaisRecentesDaObra = resolverArquivosVersaoRecente(arquivosDaObra);

  const arquivosFiltrados = arquivosMaisRecentesDaObra
    .filter((a) => {
      const pastaArquivoId = typeof a.pasta === "object" ? a.pasta?.id : a.pasta;
      return (
        pastaAtualId === null
          ? !pastaArquivoId || pastaArquivoId === null
          : String(pastaArquivoId) === String(pastaAtualId)
      );
    })
    .sort((a, b) => {
      const nomeA = a.nome || formatarNomeArquivo(a.arquivo) || "";
      const nomeB = b.nome || formatarNomeArquivo(b.arquivo) || "";
      return (
        nomeA.localeCompare(nomeB, undefined, { sensitivity: "base" }) ||
        Number(a.id || 0) - Number(b.id || 0)
      );
    });

  const tarefasDaObra = listaTarefas.filter(
    (t) =>
      String(t.projeto === "object" ? t.projeto?.id : t.projeto) ===
      String(projetoSelecionado?.id),
  );
  const tarefaSelecionadaObj = tarefasDaObra.find(
    (t) => String(t.id) === String(fluxoVersao.tarefaId),
  );

  const entrarNaPasta = (pasta) => {
    setPastaAtualId(pasta.id);
    setHistoricoCaminho([
      ...historicoCaminho,
      { id: pasta.id, nome: pasta.nome },
    ]);
  };

  const voltarParaNivel = (idx) => {
    const novo = historicoCaminho.slice(0, idx + 1);
    setHistoricoCaminho(novo);
    setPastaAtualId(novo[novo.length - 1].id);
  };

  const criarNovaPasta = async (e) => {
    e.preventDefault();
    if (
      pastasFiltradas.some(
        (p) =>
          p.nome.trim().toLowerCase() === nomeNovaPasta.trim().toLowerCase(),
      )
    )
      return alert("Pasta já existe.");
    try {
      await api.post("pastas/", {
        nome: nomeNovaPasta.trim(),
        projeto: projetoSelecionado.id,
        pasta_pai: pastaAtualId,
      });
      setNomeNovaPasta("");
      setModalPastaAberta(false);
      if (aoAtualizarDados) aoAtualizarDados();
    } catch {
      alert("Falha ao criar pasta.");
    }
  };

  const salvarEdicaoPasta = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`pastas/${pastaParaEditar.id}/`, {
        nome: nomeEdicaoPasta.trim(),
      });
      setPastaParaEditar(null);
      setNomeEdicaoPasta("");
      if (aoAtualizarDados) aoAtualizarDados();
    } catch {
      alert("Falha ao renomear.");
    }
  };

  const deletarPasta = (e, pastaId, pastaNome) => {
    e.stopPropagation();
    setConfirmacao({
      titulo: "Excluir pasta",
      mensagem: `Deseja excluir a pasta "${pastaNome}"?`,
      textoConfirmar: "Excluir",
      variante: "perigo",
      aoConfirmar: async () => {
        try {
          await api.delete(`pastas/${pastaId}/`);
          if (aoAtualizarDados) aoAtualizarDados();
        } catch {}
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
          await api.delete(`arquivos/${arquivoId}/`);
          if (aoAtualizarDados) aoAtualizarDados();
          if (arquivoVisualizando?.id === arquivoId)
            setArquivoVisualizando(null);
        } catch {}
      },
    });
  };

  const aoEscolherArquivo = (e) => {
    if (e.target.files?.length) setArquivoSelecionado(e.target.files[0]);
  };

  const cancelarUpload = () => {
    setArquivoSelecionado(null);
    setFluxoVersao({
      passo: 0,
      tarefaId: "",
      subtarefaId: "",
      marcarChecklist: true,
      arquivoPai: null,
      comentario: "",
    });
  };

  const fazerUploadECommit = async (ehNovaVersao) => {
    if (!arquivoSelecionado) return;
    const formData = new FormData();
    formData.append("arquivo", arquivoSelecionado);
    formData.append("projeto", projetoSelecionado.id);
    if (pastaAtualId !== null) formData.append("pasta", pastaAtualId);

    let nomeOriginal = arquivoSelecionado.name.split(".");
    nomeOriginal.pop();
    formData.append("nome", nomeOriginal.join("."));

    if (ehNovaVersao && fluxoVersao.arquivoPai) {
      const idRaizParaVersao =
        fluxoVersao.arquivoPai.arquivo_raiz_id || fluxoVersao.arquivoPai.id;
      formData.append("versao_de", idRaizParaVersao);
      if (fluxoVersao.tarefaId) formData.append("tarefa", fluxoVersao.tarefaId);
      if (fluxoVersao.comentario)
        formData.append("comentario", fluxoVersao.comentario);
    }

    try {
      await api.post("arquivos/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (
        ehNovaVersao &&
        fluxoVersao.subtarefaId &&
        fluxoVersao.marcarChecklist
      ) {
        await api.patch(`subtarefas/${fluxoVersao.subtarefaId}/`, {
          concluida: true,
        });
      }
      alert(
        ehNovaVersao
          ? "Nova versão vinculada com sucesso!"
          : "Arquivo salvo com sucesso!",
      );
      cancelarUpload();
      if (aoAtualizarDados) aoAtualizarDados();
    } catch {
      alert("Falha ao enviar o documento.");
    }
  };

  if (!projetoSelecionado) return null;

  const isSelecaoMode = fluxoVersao.passo === 2;

  return (
    <div className="pb-12 font-sans bg-slate-50 min-h-screen p-6 -m-6 relative">
      <button
        onClick={aoVoltar}
        className="mb-8 px-5 py-2.5 flex items-center gap-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer shadow-xs"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5"></path>
          <path d="M12 19l-7-7 7-7"></path>
        </svg>{" "}
        Voltar para Obras
      </button>

      {/* Visão Geral da Obra */}
      <ProjectOverviewCard
        projetoSelecionado={projetoSelecionado}
        clienteObj={clienteObj}
        telefoneFormatado={telefoneFormatado}
        enderecoFormatado={enderecoFormatado}
        dataCriacaoFormatada={dataCriacaoFormatada}
        mostrarPin={mostrarPin}
        setMostrarPin={setMostrarPin}
      />

      {/* Área de Upload e Versionamento */}
      <FileDropzone
        arquivoSelecionado={arquivoSelecionado}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        fileInputRef={fileInputRef}
        fluxoVersao={fluxoVersao}
        setFluxoVersao={setFluxoVersao}
        aoEscolherArquivo={aoEscolherArquivo}
        cancelarUpload={cancelarUpload}
        fazerUploadECommit={fazerUploadECommit}
      />

      {/* Navegação e Criação de Pasta */}
      <div className="flex justify-between items-center mb-4 mt-8">
        <FolderBreadcrumb
          caminho={historicoCaminho}
          onSelectLevel={voltarParaNivel}
          pastaDestinoHover={pastaDestinoHover}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
        <button
          onClick={() => setModalPastaAberta(true)}
          disabled={isSelecaoMode}
          className="disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
        >
          + Nova Pasta
        </button>
      </div>

      {/* Grid de Pastas e Arquivos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {pastasFiltradas.map((pasta) => {
          const qtdArquivos = arquivosMaisRecentesDaObra.filter((a) => {
            const pastaArquivoId =
              typeof a.pasta === "object" ? a.pasta?.id : a.pasta;
            return String(pastaArquivoId) === String(pasta.id);
          }).length;

          return (
            <FolderCard
              key={pasta.id}
              pasta={pasta}
              qtdArquivos={qtdArquivos}
              isSelecaoMode={isSelecaoMode}
              isDropTarget={pastaDestinoHover === pasta.id}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onEntrarPasta={entrarNaPasta}
              onToggleVisibilidade={toggleVisibilidadePasta}
              onEditar={(e, p) => {
                e.stopPropagation();
                setPastaParaEditar(p);
                setNomeEdicaoPasta(p.nome);
              }}
              onDeletar={deletarPasta}
            />
          );
        })}

        {arquivosFiltrados.map((arq) => {
          const nomeExibicao = formatarNomeArquivo(arq.arquivo);
          const qtdVersoes =
            arq.qtd_versoes !== undefined
              ? arq.qtd_versoes
              : listaArquivos.filter(
                  (a) =>
                    String(
                      typeof a.versao_de === "object"
                        ? a.versao_de?.id
                        : a.versao_de,
                    ) === String(arq.arquivo_raiz_id || arq.id),
                ).length;

          return (
            <FileCard
              key={arq.id}
              arq={arq}
              nomeExibicao={nomeExibicao}
              qtdVersoes={qtdVersoes}
              isSelecaoMode={isSelecaoMode}
              isDragging={arquivoArrastando?.id === arq.id}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onClick={acaoCliqueArquivo}
              onToggleVisibilidade={toggleVisibilidadeArquivo}
              onGerenciarVersoes={(e, a) => {
                e.stopPropagation();
                setGerenciarVersoesDe(a.arquivo_raiz || a);
              }}
              onDeletar={deletarArquivo}
            />
          );
        })}

        {pastasFiltradas.length === 0 && arquivosFiltrados.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
            <p className="text-sm text-slate-500 m-0">
              Esta pasta está vazia. Crie uma nova pasta ou envie arquivos
              acima.
            </p>
          </div>
        )}
      </div>

      {/* Modais de Fluxo de Versão */}
      <LinkTaskModal
        fluxoVersao={fluxoVersao}
        setFluxoVersao={setFluxoVersao}
        tarefasDaObra={tarefasDaObra}
        tarefaSelecionadaObj={tarefaSelecionadaObj}
        cancelarUpload={cancelarUpload}
      />
      <ConfirmCommitModal
        fluxoVersao={fluxoVersao}
        setFluxoVersao={setFluxoVersao}
        arquivoSelecionado={arquivoSelecionado}
        formatarNomeArquivo={formatarNomeArquivo}
        cancelarUpload={cancelarUpload}
        fazerUploadECommit={fazerUploadECommit}
      />
      <VersionHistoryModal
        gerenciarVersoesDe={gerenciarVersoesDe}
        setGerenciarVersoesDe={setGerenciarVersoesDe}
        listaArquivos={listaArquivos}
        formatarNomeArquivo={formatarNomeArquivo}
        getFileUrl={getFileUrl}
        forcarDownload={forcarDownload}
      />

      {/* Modal de Pré-visualização de Imagem e Feedbacks */}
      <ImagePreviewModal
        arquivo={arquivoVisualizando}
        getFileUrl={getFileUrl}
        formatarNomeArquivo={formatarNomeArquivo}
        onDownload={forcarDownload}
        onClose={() => setArquivoVisualizando(null)}
        aoAtualizarDados={aoAtualizarDados}
      />

      {/* Modais de Pasta */}
      {modalPastaAberta && (
        <FolderModal
          titulo="Criar Nova Pasta"
          label="Nome da Pasta"
          valor={nomeNovaPasta}
          onChange={setNomeNovaPasta}
          onSubmit={criarNovaPasta}
          onClose={() => setModalPastaAberta(false)}
          textoConfirmar="Criar Pasta"
        />
      )}

      {pastaParaEditar && (
        <FolderModal
          titulo="Renomear Pasta"
          label="Novo Nome"
          valor={nomeEdicaoPasta}
          onChange={setNomeEdicaoPasta}
          onSubmit={salvarEdicaoPasta}
          onClose={() => setPastaParaEditar(null)}
          textoConfirmar="Salvar"
        />
      )}

      {/* Modal de Confirmação de Ação */}
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

      {/* Modal de Confirmação de Transferência de Arquivo (Drag and Drop) */}
      <MoveFileModal
        confirmacao={confirmacaoMover}
        estaMovendo={estaMovendo}
        erro={erroMover}
        onConfirmar={executarMover}
        onCancelar={cancelarMover}
      />
    </div>
  );
}
