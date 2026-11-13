import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: process.env.ENV_FILE ?? "src/.env" });

function variableRequerida(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) throw new Error(`Falta configurar la variable ${nombre}.`);
  return valor;
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  user: variableRequerida("DB_USER"),
  password: process.env.DB_PASSWORD ?? "",
  database: variableRequerida("DB_NAME"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

export async function probarConexion(): Promise<void> {
  const connection = await pool.getConnection();

  try {
    await connection.ping();
    console.log("Conexión con MySQL establecida");
  } finally {
    connection.release();
  }
}