const pool = require("../database/PoolConexion");

async function existsByEmail(email) {
  const [rows] = await pool.execute(
    "SELECT id FROM Usuarios WHERE correo = ?",
    [email],
  );

  return rows.length > 0;
}

module.exports = {
  existsByEmail,
};
