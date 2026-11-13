import type { Cita, EstadoCita, NuevaCita } from "../types";

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3001/api/citas"
).replace(/\/$/, "");

export async function obtenerCitas(): Promise<Cita[]> {
  const respuesta = await fetch(API_URL);
  if (!respuesta.ok) {
    throw new Error("No fue posible consultar las citas.");
  }
  return respuesta.json();
}

export async function registrarCita(datos: NuevaCita): Promise<Cita> {
  const respuesta = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  const resultado = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(resultado.mensaje ?? "No fue posible registrar la cita.");
  }
  return resultado.cita;
}

export async function actualizarEstado(
  id: number, estado: EstadoCita,
): Promise<Cita> {
  const respuesta = await fetch(`${API_URL}/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });

  const resultado = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(resultado.mensaje ?? "No fue posible actualizar la cita.");
  }
  return resultado.cita;
}