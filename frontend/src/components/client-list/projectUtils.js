export function findClient(clientes, projeto) {
  return clientes?.find((cliente) => cliente.id === projeto.cliente) || null;
}

export function formatPhone(cliente) {
  if (!cliente?.telefone) return null;
  return `${cliente.ddi || "+55"} ${cliente.ddd ? `(${cliente.ddd})` : ""} ${cliente.telefone}`;
}

export function filterProjects(projetos, clientes, { abaFiltro, busca, filtroTipo }) {
  const termo = busca.toLowerCase();
  return projetos.filter((projeto) => {
    const cliente = findClient(clientes, projeto);
    return (abaFiltro === "ativos" ? !projeto.arquivado : projeto.arquivado) &&
      ((projeto.nome_projeto || "").toLowerCase().includes(termo) ||
        (cliente?.nome || "").toLowerCase().includes(termo)) &&
      (!filtroTipo || projeto.tipo_projeto === filtroTipo);
  });
}

export function filterClients(clientes, { busca, filtroStatusCliente }) {
  const termo = (busca || "").toLowerCase().trim();
  return (clientes || []).filter((cliente) => {
    const atendeStatus =
      filtroStatusCliente === "todos"
        ? true
        : filtroStatusCliente === "excluidos"
          ? Boolean(cliente.deletado)
          : !cliente.deletado;

    if (!atendeStatus) return false;
    if (!termo) return true;

    const nomeMatch = (cliente.nome || "").toLowerCase().includes(termo);
    const idMatch = String(cliente.id || "").includes(termo);
    const idPadMatch = String(cliente.id || "").padStart(4, "0").includes(termo);
    const codigoMatch = (cliente.codigo_acesso || "").toLowerCase().includes(termo);

    return nomeMatch || idMatch || idPadMatch || codigoMatch;
  });
}
