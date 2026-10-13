import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Load .env.test if it exists, otherwise fallback to .env
const envTestPath = path.resolve(__dirname, '../.env.test');
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envTestPath)) {
  dotenv.config({ path: envTestPath });
} else {
  dotenv.config({ path: envPath });
}

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const SOURCE_DB_NAME = process.env.SOURCE_DB_NAME || 'Sistema_Medico_JYP';
const TARGET_DB_NAME = process.env.DB_NAME || 'Sistema_Medico_JYP_test';

export async function runTestMigrations(options: { reset?: boolean } = {}) {
  // Safety check: protect production DB
  if (TARGET_DB_NAME === SOURCE_DB_NAME) {
    throw new Error(
      `[SEGURIDAD] El nombre de la base de datos de prueba no puede ser igual al de producción ('${SOURCE_DB_NAME}'). Abortando.`
    );
  }

  console.log('='.repeat(60));
  console.log(` Iniciando sincronización de migraciones para BD de prueba`);
  console.log(` Host: ${DB_HOST}:${DB_PORT} | Usuario: ${DB_USER}`);
  console.log(` BD Destino: ${TARGET_DB_NAME}`);
  console.log('='.repeat(60));

  // Connect without database selected
  const rootConn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    multipleStatements: true,
  });

  try {
    if (options.reset) {
      console.log(`[Reset] Eliminando base de datos '${TARGET_DB_NAME}'...`);
      await rootConn.query(`DROP DATABASE IF EXISTS \`${TARGET_DB_NAME}\`;`);
      console.log(`[Reset] Base de datos eliminada.`);
    }

    // Ensure database exists
    await rootConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${TARGET_DB_NAME}\` DEFAULT CHARACTER SET utf8mb4;`
    );

    // Ensure tracking table exists
    await rootConn.query(`USE \`${TARGET_DB_NAME}\`;`);
    await rootConn.query(`
      CREATE TABLE IF NOT EXISTS \`_migration_history\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL UNIQUE,
        \`applied_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Get applied migrations
    const [rows] = await rootConn.query<mysql.RowDataPacket[]>(
      `SELECT name FROM \`_migration_history\`;`
    );
    const appliedSet = new Set<string>(rows.map((r) => r.name));

    // Read migrations directory
    const migrationsDir = path.resolve(__dirname, '../migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.warn(`[Aviso] El directorio de migraciones no existe: ${migrationsDir}`);
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    console.log(`Se encontraron ${files.length} archivo(s) de migración.`);

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`⏩ [Saltada] Ya aplicada: ${file}`);
        continue;
      }

      console.log(`⚙️  [Aplicando] ${file}...`);
      const filePath = path.join(migrationsDir, file);
      let sqlContent = fs.readFileSync(filePath, 'utf-8');

      // Replace references to production DB name with test DB name
      const regex = new RegExp(`\`?${SOURCE_DB_NAME}\`?`, 'g');
      sqlContent = sqlContent.replace(regex, `\`${TARGET_DB_NAME}\``);

      // Execute migration
      await rootConn.query(sqlContent);

      // Ensure _migration_history table exists (in case 001 dropped the schema)
      await rootConn.query(`USE \`${TARGET_DB_NAME}\`;`);
      await rootConn.query(`
        CREATE TABLE IF NOT EXISTS \`_migration_history\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`name\` VARCHAR(255) NOT NULL UNIQUE,
          \`applied_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);

      // Record migration
      await rootConn.query(
        `INSERT INTO \`_migration_history\` (\`name\`) VALUES (?) ON DUPLICATE KEY UPDATE \`applied_at\` = CURRENT_TIMESTAMP;`,
        [file]
      );
      appliedSet.add(file);
      console.log(`✅ [Completada] ${file}`);
    }

    console.log('='.repeat(60));
    console.log(` Base de datos de prueba sincronizada exitosamente.`);
    console.log('='.repeat(60));
  } finally {
    await rootConn.end();
  }
}

// Allow execution from CLI: tsx scripts/migrate-test-db.ts [--reset]
if (require.main === module) {
  const isReset = process.argv.includes('--reset');
  runTestMigrations({ reset: isReset })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error ejecutando migraciones de prueba:', err);
      process.exit(1);
    });
}
