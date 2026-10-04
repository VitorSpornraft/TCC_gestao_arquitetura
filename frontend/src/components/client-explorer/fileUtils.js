export function getFileUrl(urlPath) {
  if (!urlPath) return "";
  if (urlPath.startsWith("http://") || urlPath.startsWith("https://")) {
    return urlPath;
  }

  const finalPath = urlPath.startsWith("/media/")
    ? urlPath
    : urlPath.startsWith("/")
      ? `/media${urlPath}`
      : `/media/${urlPath}`;

  return `http://127.0.0.1:8000${finalPath}`;
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
