import { useEffect, useState, type FormEvent } from "react";
import { AppointmentCard } from "../components/AppointmentCard";
import { StatCard } from "../components/StatCard";
//import { citasIniciales } from "../data/citas";
import {
  actualizarEstado, obtenerCitas, registrarCita,
} from "../services/citasApi";

import type { Cita, EstadoCita, NuevaCita } from "../types";

type Filtro = "todas" | EstadoCita;

export function AppointmentsPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarCitas() {
      try {
        setCargando(true);
        setError("");
        setCitas(await obtenerCitas());
      } catch (error) {
        setError(error instanceof Error ? error.message : "Ocurrió un error.");
      } finally {
        setCargando(false);
      }
    }

    void cargarCitas();
  }, []);

  async function guardarCita(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formulario = new FormData(event.currentTarget);
    const datos: NuevaCita = {
      mascota: String(formulario.get("mascota") ?? "").trim(),
      cliente: String(formulario.get("cliente") ?? "").trim(),
      servicio: String(formulario.get("servicio") ?? "").trim(),
      fecha: String(formulario.get("fecha") ?? ""),
      hora: String(formulario.get("hora") ?? ""),
    };

    try {
      setGuardando(true);
      setError("");
      setMensaje("");
      const cita = await registrarCita(datos);
      setCitas((actuales) => [...actuales, cita]);
      setMostrarFormulario(false);
      setMensaje("La cita se registró correctamente.");

      try {
        setCitas(await obtenerCitas());
      } catch {
        setError("La cita se guardó, pero no se pudo actualizar la lista.");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo guardar la cita.");
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarCita(id: number) {
    try {
      setError("");
      const actualizada = await actualizarEstado(id, "confirmada");
      setCitas((actuales) =>
        actuales.map((cita) => (cita.id === id ? actualizada : cita)),
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al confirmar.");
    }
  }

  const citasFiltradas =
    filtro === "todas" ? citas : citas.filter((cita) => cita.estado === filtro);

  const pendientes = citas.filter((c) => c.estado === "solicitada").length;
  const confirmadas = citas.filter((c) => c.estado === "confirmada").length;


  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-950">Agenda de citas</h2>
          <p className="mt-1 text-slate-600">
            Consulta y administra las citas del día.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMostrarFormulario((visible) => !visible)}
          className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
        >
          + Nueva cita
        </button>
      </section>

      {mostrarFormulario && (
        <form
          onSubmit={guardarCita}
          className="mt-6 grid gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:grid-cols-2"
        >
          <h2 className="text-xl font-bold text-slate-900 sm:col-span-2">
            Registrar nueva cita
          </h2>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Mascota
            <input
              name="mascota"
              required
              className="rounded-xl border border-slate-300 px-4 py-3 font-normal"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Cliente
            <input
              name="cliente"
              required
              className="rounded-xl border border-slate-300 px-4 py-3 font-normal"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Servicio
            <input
              name="servicio"
              required
              className="rounded-xl border border-slate-300 px-4 py-3 font-normal"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Fecha
            <input
              name="fecha"
              type="date"
              required
              className="rounded-xl border border-slate-300 px-4 py-3 font-normal"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Hora
            <input
              name="hora"
              type="time"
              required
              className="rounded-xl border border-slate-300 px-4 py-3 font-normal"
            />
          </label>
          <div className="flex items-center gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={guardando}
              className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Guardar cita"}
            </button>
            <button
              type="button"
              onClick={() => setMostrarFormulario(false)}
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          titulo="Citas de hoy"
          valor={citas.length}
          color="text-teal-700"
        />
        <StatCard
          titulo="Pendientes"
          valor={pendientes}
          color="text-amber-600"
        />
        <StatCard
          titulo="Confirmadas"
          valor={confirmadas}
          color="text-green-600"
        />
      </section>

      <section className="mt-8">
        <label
          htmlFor="filtro"
          className="mb-2 block font-semibold text-slate-700"
        >
          Filtrar por estado
        </label>
        <select
          id="filtro"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as Filtro)}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 sm:w-64"
        >
          <option value="todas">Todas</option>
          <option value="solicitada">Solicitadas</option>
          <option value="confirmada">Confirmadas</option>
          <option value="atendida">Atendidas</option>
          <option value="rechazada">Rechazadas</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </section>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl bg-red-100 px-4 py-3 text-red-800"
        >
          {error}
        </p>
      )}

      {mensaje && (
        <p
          aria-live="polite"
          className="mt-6 rounded-xl bg-green-100 px-4 py-3 text-green-800"
        >
          {mensaje}
        </p>
      )}

      <section className="mt-6 grid gap-4">
        {cargando ? (
          <p className="rounded-2xl bg-white p-8 text-center text-slate-500">
            Cargando citas...
          </p>
        ) : citasFiltradas.length > 0 ? (
          citasFiltradas.map((cita) => (
            <AppointmentCard
              key={cita.id}
              cita={cita}
              onConfirmar={confirmarCita}
            />
          ))
        ) : (
          <p className="rounded-2xl bg-white p-8 text-center text-slate-500">
            No se encontraron citas con ese estado.
          </p>
        )}
      </section>
    </main>
  );
}