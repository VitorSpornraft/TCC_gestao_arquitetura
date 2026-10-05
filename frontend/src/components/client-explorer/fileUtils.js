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
