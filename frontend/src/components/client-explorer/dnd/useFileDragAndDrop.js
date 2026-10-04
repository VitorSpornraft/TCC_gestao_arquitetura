import { useState, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../api";

/**
 * Hook customizado para gerenciar toda a lógica de Drag & Drop de arquivos
 * e transferência entre pastas no Explorador de Arquivos.
 */
export function useFileDragAndDrop({ aoAtualizarDados }) {
  const [arquivoArrastando, setArquivoArrastando] = useState(null);
  const [pastaDestinoHover, setPastaDestinoHover] = useState(null);
  const [confirmacaoMover, setConfirmacaoMover] = useState(null);
  const [estaMovendo, setEstaMovendo] = useState(false);
  const [erroMover, setErroMover] = useState(null);

  // Início do arrasto do arquivo
  const handleDragStart = useCallback((e, arquivo) => {
    setArquivoArrastando(arquivo);
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("application/json", JSON.stringify(arquivo));
      e.dataTransfer.setData("text/plain", String(arquivo.id));
    } catch {
      // Fallback para navegadores com restrições
    }
  }, []);

  // Fim do arrasto (drop realizado ou cancelado)
  const handleDragEnd = useCallback(() => {
    setArquivoArrastando(null);
    setPastaDestinoHover(null);
  }, []);

  // Quando o arquivo está sobrevoando uma pasta
  const handleDragOver = useCallback((e, pasta) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  // Quando o arquivo entra no card da pasta (com proteção contra flicker de nós filhos)
  const handleDragEnter = useCallback((e, pasta) => {
    e.preventDefault();
    const pastaId = pasta ? pasta.id : null;
    setPastaDestinoHover(pastaId === null ? "raiz" : pastaId);
  }, []);

  // Quando o arquivo sai do card da pasta
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    // Previne flicker quando o cursor passa por elementos filhos dentro do card
    if (e.currentTarget && e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) {
      return;
    }
    setPastaDestinoHover(null);
  }, []);

  // Quando o arquivo é solto sobre a pasta de destino
  const handleDrop = useCallback((e, pastaDestino) => {
    e.preventDefault();
    e.stopPropagation();
    setPastaDestinoHover(null);

    let arquivoParaMover = arquivoArrastando;
    if (!arquivoParaMover) {
      try {
        const rawJson = e.dataTransfer.getData("application/json");
        if (rawJson) {
          arquivoParaMover = JSON.parse(rawJson);
        }
      } catch {
        // Fallback
      }
    }

    if (!arquivoParaMover) return;

    // Verificar se o arquivo já está na mesma pasta de destino
    const pastaAtualId = arquivoParaMover.pasta !== undefined
      ? (typeof arquivoParaMover.pasta === "object" ? arquivoParaMover.pasta?.id : arquivoParaMover.pasta)
      : null;
    const destinoId = pastaDestino ? pastaDestino.id : null;

    if (String(pastaAtualId ?? "") === String(destinoId ?? "")) {
      // O arquivo já se encontra nesta pasta
      setArquivoArrastando(null);
      return;
    }

    // Abre o modal de confirmação para o usuário
    setConfirmacaoMover({
      arquivo: arquivoParaMover,
      pastaDestino: {
        id: destinoId,
        nome: pastaDestino?.nome || "Raiz do Projeto",
      },
    });

    setArquivoArrastando(null);
  }, [arquivoArrastando]);

  // Cancelar a operação de mover
  const cancelarMover = useCallback(() => {
    setConfirmacaoMover(null);
    setErroMover(null);
  }, []);

  // Executar a transferência via API
  const executarMover = useCallback(async () => {
    if (!confirmacaoMover?.arquivo) return;

    setEstaMovendo(true);
    setErroMover(null);

    const arquivoId = confirmacaoMover.arquivo.id;
    const novaPastaId = confirmacaoMover.pastaDestino.id;

    try {
      await axios.patch(`${API_BASE_URL}/arquivos/${arquivoId}/`, {
        pasta: novaPastaId,
      });

      if (aoAtualizarDados) {
        await aoAtualizarDados();
      }

      setConfirmacaoMover(null);
    } catch (err) {
      console.error("Erro ao mover arquivo:", err);
      setErroMover("Ocorreu um erro ao tentar mover o arquivo para a pasta selecionada.");
    } finally {
      setEstaMovendo(false);
    }
  }, [confirmacaoMover, aoAtualizarDados]);

  return {
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
  };
}
