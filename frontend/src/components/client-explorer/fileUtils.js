const BACKEND_BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

export function getFileUrl(urlPath) {
  if (!urlPath || typeof urlPath !== "string") return "";
  if (urlPath.startsWith("http://") || urlPath.startsWith("https://")) {
    return urlPath;
  }

  const finalPath = urlPath.startsWith("/media/")
    ? urlPath
    : urlPath.startsWith("/")
      ? `/media${urlPath}`
      : `/media/${urlPath}`;

  return `${BACKEND_BASE}${finalPath}`;
}

export function extrairExtensaoArquivo(arq) {
  if (!arq) return "";
  const caminhos = [
    typeof arq === "string" ? arq : null,
    typeof arq?.arquivo === "string" ? arq.arquivo : null,
    typeof arq?.nome === "string" ? arq.nome : null,
  ].filter(Boolean);

  for (const c of caminhos) {
    const limpo = c.split("?")[0].split("#")[0];
    const partes = limpo.split(".");
    if (partes.length > 1) {
      const ext = partes.pop().toLowerCase();
      if (ext) return ext;
    }
  }
  return "";
}

export function isArquivoPdf(arq) {
  return extrairExtensaoArquivo(arq) === "pdf";
}

export function isArquivoImagem(arq) {
  const ext = extrairExtensaoArquivo(arq);
  return ["png", "jpg", "jpeg"].includes(ext);
}

export function formatarNomeArquivo(urlOuCaminho) {
  if (!urlOuCaminho) return "Documento";
  const nomeOriginal = urlOuCaminho.split("/").pop();
  return nomeOriginal.replace(/_[A-Za-z0-9]{6,8}(\.[^.]+)$/, "$1");
}

export async function forcarDownload(url, nomeArquivo) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank");
  }
}

/**
 * LÓGICA DE 'LATEST VERSION RESOLUTION':
 * Agrupa arquivos encadeados por 'versao_de' e resolve para cada família
 * apenas a versão mais recente (maior ID / data de criação mais recente).
 *
 * O objeto retornado possui os dados ativos da versão mais recente, enriquecidos
 * com referências da raiz (arquivo_raiz, arquivo_raiz_id, qtd_versoes, todas_versoes).
 *
 * @param {Array} listaArquivos - Lista de arquivos a consolidar.
 * @returns {Array} Lista contendo apenas o arquivo mais recente de cada família.
 */
export function resolverArquivosVersaoRecente(listaArquivos) {
  if (!Array.isArray(listaArquivos) || listaArquivos.length === 0) {
    return [];
  }

  // Mapa para busca rápida de arquivos por ID (string e number)
  const arquivosMap = new Map();
  for (const arq of listaArquivos) {
    if (arq && arq.id !== undefined && arq.id !== null) {
      arquivosMap.set(String(arq.id), arq);
    }
  }

  // Função para rastrear o ID raiz da família navegando pela cadeia de versao_de
  const encontrarIdRaiz = (arq) => {
    let atual = arq;
    const visitados = new Set();

    while (atual) {
      const versaoDeRaw = atual.versao_de;
      const versaoDeId =
        typeof versaoDeRaw === 'object' && versaoDeRaw !== null
          ? versaoDeRaw.id
          : versaoDeRaw;

      if (!versaoDeId || visitados.has(String(versaoDeId))) {
        break;
      }
      visitados.add(String(atual.id));

      const pai = arquivosMap.get(String(versaoDeId));
      if (!pai) {
        return String(versaoDeId);
      }
      atual = pai;
    }
    return String(atual.id);
  };

  // Agrupa os arquivos por ID raiz
  const gruposPorRaiz = new Map();
  for (const arq of listaArquivos) {
    if (!arq) continue;
    const raizId = encontrarIdRaiz(arq);
    if (!gruposPorRaiz.has(raizId)) {
      gruposPorRaiz.set(raizId, []);
    }
    gruposPorRaiz.get(raizId).push(arq);
  }

  // Para cada grupo, resolve a versão mais recente
  const arquivosResolvidos = [];

  for (const [raizId, familia] of gruposPorRaiz.entries()) {
    // Ordena do mais recente para o mais antigo:
    // 1º: criado_em mais recente
    // 2º: maior ID (auto-increment)
    familia.sort((a, b) => {
      const dataA = a.criado_em ? new Date(a.criado_em).getTime() : 0;
      const dataB = b.criado_em ? new Date(b.criado_em).getTime() : 0;
      if (dataB !== dataA) {
        return dataB - dataA;
      }
      return Number(b.id || 0) - Number(a.id || 0);
    });

    const maisRecente = familia[0];
    const arquivoRaiz =
      familia.find((a) => !a.versao_de) ||
      arquivosMap.get(String(raizId)) ||
      familia[familia.length - 1];

    // Objeto consolidado: atributos ativos da versão mais recente + metadados da árvore
    const arquivoConsolidado = {
      ...arquivoRaiz,
      ...maisRecente,
      id: maisRecente.id,
      arquivo: maisRecente.arquivo,
      nome: maisRecente.nome || arquivoRaiz?.nome,
      status_aprovacao: maisRecente.status_aprovacao || 'PENDENTE',
      feedbacks: Array.isArray(maisRecente.feedbacks)
        ? maisRecente.feedbacks
        : (Array.isArray(arquivoRaiz?.feedbacks) ? arquivoRaiz.feedbacks : []),
      comentario: maisRecente.comentario,
      criado_em: maisRecente.criado_em,
      visivel_cliente:
        maisRecente.visivel_cliente !== undefined
          ? maisRecente.visivel_cliente
          : Boolean(arquivoRaiz?.visivel_cliente),
      pasta:
        maisRecente.pasta !== undefined && maisRecente.pasta !== null
          ? maisRecente.pasta
          : arquivoRaiz?.pasta,
      projeto:
        maisRecente.projeto !== undefined && maisRecente.projeto !== null
          ? maisRecente.projeto
          : arquivoRaiz?.projeto,
      arquivo_raiz_id: arquivoRaiz?.id || raizId,
      arquivo_raiz: arquivoRaiz,
      qtd_versoes: Math.max(0, familia.length - 1),
      todas_versoes: familia,
    };

    arquivosResolvidos.push(arquivoConsolidado);
  }

  return arquivosResolvidos;
}
