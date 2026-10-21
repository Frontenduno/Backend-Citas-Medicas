import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Migrador para la base de datos de desarrollo.
// Aplica solo migraciones numeradas (001_, 002_, ...) y nunca scripts de seed.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'Sistema_Medico_JYP';

const MIGRATIONS_DIR = path.resolve(__dirname, '../migrations');
const BASELINE_MIGRATION = '001_init_db.sql';

async function run() {
  if (DB_NAME.toLowerCase().includes('_test')) {
    throw new Error(
      `[SEGURIDAD] DB_NAME='${DB_NAME}' parece una base de pruebas. Usa 'npm run db:test:migrate' para la BD de test.`
    );
  }

  console.log('='.repeat(60));
  console.log(' Aplicando migraciones a la base de datos de desarrollo');
  console.log(` Host: ${DB_HOST}:${DB_PORT} | Usuario: ${DB_USER}`);
  console.log(` BD Destino: ${DB_NAME}`);
  console.log('='.repeat(60));

  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    multipleStatements: true,
  });

  try {
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4;`
    );
    await conn.query(`USE \`${DB_NAME}\`;`);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`_migration_history\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL UNIQUE,
        \`applied_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    const [history] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT name FROM \`_migration_history\`;`
    );

    // Si la BD ya existía antes de usar este migrador, se asume que 001 ya está aplicada.
    if (history.length === 0) {
      const [existing] = await conn.query<mysql.RowDataPacket[]>(
        `SELECT TABLE_NAME FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Usuario'`,
        [DB_NAME]
      );

      if (existing.length > 0) {
        await conn.query(
          `INSERT INTO \`_migration_history\` (\`name\`) VALUES (?)`,
          [BASELINE_MIGRATION]
        );
        console.log(`[Bootstrap] BD existente detectada. Se marca como aplicada: ${BASELINE_MIGRATION}`);
      }
    }

    const [appliedRows] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT name FROM \`_migration_history\`;`
    );
    const applied = new Set<string>(appliedRows.map((r) => r.name));

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => /^\d+_.*\.sql$/.test(file))
      .sort();

    console.log(`Se encontraron ${files.length} migraciones numeradas.`);

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`⏩ [Saltada] Ya aplicada: ${file}`);
        continue;
      }

      console.log(`⚙️  [Aplicando] ${file}...`);
      let sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');

      // Las migraciones referencian el nombre de la BD de desarrollo.
      const sourceName = 'Sistema_Medico_JYP';
      if (DB_NAME !== sourceName) {
        sql = sql.replace(new RegExp(`\`?${sourceName}\`?`, 'g'), `\`${DB_NAME}\``);
      }

      await conn.query(sql);
      await conn.query(`USE \`${DB_NAME}\`;`);
      await conn.query(
        `INSERT INTO \`_migration_history\` (\`name\`) VALUES (?) ON DUPLICATE KEY UPDATE \`applied_at\` = CURRENT_TIMESTAMP;`,
        [file]
      );
      console.log(`✅ [Completada] ${file}`);
    }

    console.log('='.repeat(60));
    console.log(' Base de datos de desarrollo sincronizada exitosamente.');
    console.log('='.repeat(60));
  } finally {
    await conn.end();
  }
}

run().catch((err) => {
  console.error('❌ Error ejecutando migraciones de desarrollo:', err);
  process.exit(1);
});
