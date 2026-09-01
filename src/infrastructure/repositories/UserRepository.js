const { getConnection } = require("../database/PoolConexion");
const { Usuario } = require("../../domain/entity/Usuario");


async function existsByEmail(email) {
  const connection = await getConnection();
  const [rows] = await connection.execute(
    "SELECT idUsuario FROM Usuario WHERE correo = ?",
    [email],
  );

  return rows.length > 0;
}

async function findUsuariobyEmail(email) {
  const connection = await getConnection();
  const [row] = await connection.execute(
    "SELECT * FROM Usuario WHERE correo = ?",
    [email],
  );

  const userResult = row[0];
  let usuario;
  if (row.length > 0) {
    usuario = new Usuario(
      userResult.idUsuario,
      userResult.contrasena,
      userResult.nombres,
      userResult.apellidos,
      userResult.correo,
      userResult.telefono,
      userResult.rol,
    );
  }

  return usuario || null;
}

module.exports = {
  existsByEmail,
  findUsuariobyEmail,
};
