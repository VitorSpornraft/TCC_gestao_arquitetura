import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../api";
import CalendarGrid from "./CalendarGrid";
import DailyAppointments from "./DailyAppointments";
import EventModal from "./EventModal";
import ConfirmActionModal from "../modals/ConfirmActionModal";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const createEvent = (data) => ({
  titulo: "",
  descricao: "",
  data,
  horario: "09:00",
  duracao_minutos: 60,
  projeto: "",
  concluido: false,
});

export default function Calendar({ projetos = [], tarefas = [] }) {
  const hoje = new Date().toISOString().split("T")[0];
  const [eventos, setEventos] = useState([]);
  const [dataAtual, setDataAtual] = useState(new Date(2026, 8, 1));
  const [diaSelecionado, setDiaSelecionado] = useState(hoje);
  const [eventoModal, setEventoModal] = useState(null);
  const [confirmacao, setConfirmacao] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/eventos/`)
      .then((resposta) => setEventos(resposta.data))
      .catch((error) => console.error("Erro ao carregar eventos:", error));
  }, []);

  const abrirNovoEvento = (data) => {
    setEventoModal(createEvent(data || diaSelecionado));
  };

  const abrirEditarEvento = (evento) => {
    setEventoModal({
      id: evento.id,
      titulo: evento.titulo,
      descricao: evento.descricao || "",
      data: evento.data,
      horario: evento.horario ? evento.horario.slice(0, 5) : "09:00",
      duracao_minutos: evento.duracao_minutos || 60,
      projeto: evento.projeto || "",
      concluido: Boolean(evento.concluido),
    });
  };

  const salvarEvento = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        titulo: eventoModal.titulo,
        descricao: eventoModal.descricao || "",
        data: eventoModal.data,
        horario: eventoModal.horario || null,
        duracao_minutos: eventoModal.duracao_minutos
          ? Number(eventoModal.duracao_minutos)
          : 60,
        projeto: eventoModal.projeto ? Number(eventoModal.projeto) : null,
        concluido: Boolean(eventoModal.concluido),
      };

      if (eventoModal.id) {
        const resposta = await axios.put(
          `${API_BASE_URL}/eventos/${eventoModal.id}/`,
          payload,
        );
        setEventos(
          eventos.map((e) => (e.id === eventoModal.id ? resposta.data : e)),
        );
      } else {
        const resposta = await axios.post(
          `${API_BASE_URL}/eventos/`,
          payload,
        );
        setEventos([...eventos, resposta.data]);
      }
      setEventoModal(null);
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      alert("Erro ao salvar evento.");
    }
  };

  const toggleConcluidoEvento = async (id, novoStatus) => {
    try {
      const resposta = await axios.patch(`${API_BASE_URL}/eventos/${id}/`, {
        concluido: novoStatus,
      });
      setEventos(eventos.map((e) => (e.id === id ? resposta.data : e)));
    } catch (error) {
      console.error("Erro ao atualizar status do evento:", error);
      alert("Erro ao atualizar status do evento.");
    }
  };

  const deletarEvento = (id, titulo) => {
    setConfirmacao({
      titulo: "Excluir Evento",
      mensagem: `Deseja realmente excluir o evento "${titulo}"? Esta ação não poderá ser desfeita.`,
      textoConfirmar: "Excluir",
      variante: "perigo",
      aoConfirmar: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/eventos/${id}/`);
          setEventos((prev) => prev.filter((e) => e.id !== id));
        } catch (error) {
          console.error("Erro ao excluir evento:", error);
          alert("Erro ao excluir evento.");
        }
      },
    });
  };

  const tarefasComoEventos = tarefas
    .filter((tarefa) => tarefa.prazo && !tarefa.arquivado)
    .map((tarefa) => ({
      id: `tarefa-${tarefa.id}`,
      titulo: tarefa.titulo,
      data: tarefa.prazo.split("T")[0],
      horario: "23:59",
      tipo: "tarefa",
      status: tarefa.status,
    }));

  const compromissos = [...eventos, ...tarefasComoEventos];
  const ano = dataAtual.getFullYear();
  const mes = dataAtual.getMonth();

  return (
    <div className="space-y-6 font-sans p-2">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight m-0">
            Calendário
          </h2>
        </div>
        <button
          onClick={() => abrirNovoEvento(diaSelecionado)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer w-fit"
        >
          + Novo Evento
        </button>
      </header>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setDataAtual(new Date(ano, mes - 1, 1))}
          className="p-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 transition-colors cursor-pointer shadow-2xs"
        >
          ‹
        </button>
        <span className="text-sm font-bold text-zinc-800 min-w-[150px] text-center">
          {MESES[mes]} {ano}
        </span>
        <button
          onClick={() => setDataAtual(new Date(ano, mes + 1, 1))}
          className="p-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 transition-colors cursor-pointer shadow-2xs"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CalendarGrid
          ano={ano}
          mes={mes}
          primeiroDiaMes={new Date(ano, mes, 1).getDay()}
          totalDiasMes={new Date(ano, mes + 1, 0).getDate()}
          diaSelecionado={diaSelecionado}
          compromissos={compromissos}
          onSelectDay={setDiaSelecionado}
        />
        <DailyAppointments
          data={diaSelecionado}
          compromissos={compromissos.filter(
            (compromisso) => compromisso.data === diaSelecionado,
          )}
          onEditarEvento={abrirEditarEvento}
          onToggleConcluido={toggleConcluidoEvento}
          onDeletarEvento={deletarEvento}
          onNovoEvento={() => abrirNovoEvento(diaSelecionado)}
        />
      </div>

      <EventModal
        evento={eventoModal}
        projetos={projetos}
        onChange={setEventoModal}
        onClose={() => setEventoModal(null)}
        onSubmit={salvarEvento}
      />

      {confirmacao && (
        <ConfirmActionModal
          titulo={confirmacao.titulo}
          mensagem={confirmacao.mensagem}
          textoConfirmar={confirmacao.textoConfirmar}
          variante={confirmacao.variante}
          onConfirmar={() => {
            confirmacao.aoConfirmar();
            setConfirmacao(null);
          }}
          onFechar={() => setConfirmacao(null)}
        />
      )}
    </div>
  );
}
