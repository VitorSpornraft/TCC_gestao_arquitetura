export const TASK_TEMPLATES = [
  {
    titulo: "Reunião de Briefing e Levantamento",
    categoria: "Briefing",
    prioridade: "normal",
    checklist: [
      "Anotar necessidades do cliente",
      "Medir o terreno/imóvel",
      "Fotografar o local",
    ],
  },
  {
    titulo: "Elaboração de Estudo Preliminar (3D)",
    categoria: "Estudo Preliminar",
    prioridade: "urgente",
    checklist: [
      "Modelagem 3D básica",
      "Planta baixa de layout",
      "Apresentação para o cliente",
    ],
  },
  {
    titulo: "Desenho de Projeto Executivo",
    categoria: "Executivo",
    prioridade: "normal",
    checklist: [
      "Planta de demolição/construção",
      "Paginação de piso",
      "Detalhamento de marcenaria",
    ],
  },
  {
    titulo: "Revisão de Compatibilização",
    categoria: "Revisão",
    prioridade: "revisao",
    checklist: [
      "Verificar projeto estrutural",
      "Verificar hidráulica e elétrica",
      "Ajustes finais",
    ],
  },
];

export function createEmptyTask() {
  return {
    titulo: "",
    projeto: "",
    categoria: "",
    prazo: "",
    prioridade: "normal",
    status: "WIP",
    checklistTemplate: [],
  };
}
