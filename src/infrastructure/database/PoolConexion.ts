import dotenv from 'dotenv';
import mysql, { Pool, PoolConnection } from 'mysql2/promise';

dotenv.config();

const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'CitasMedicasJYP',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function getConnection(): Promise<PoolConnection> {
  return await pool.getConnection();
}

export async function closeConnection(): Promise<void> {
  await pool.end();
}

export default {
  getConnection,
  closeConnection,
};

