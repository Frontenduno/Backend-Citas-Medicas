const { pool } = require("../database/PoolConexion");
const { Usuario } = require("../../domain/entity/Usuario");

async function existsByEmail(email, connection = null) {
  const executor = connection || pool;

  const [rows] = await executor.execute(
    "SELECT idUsuario FROM Usuario WHERE correo = ?",
    [email],
  );

  return rows.length > 0;
}

async function findUsuariobyEmail(email, connection = null) {
  const executor = connection || pool;

  const [rows] = await executor.execute(
    "SELECT * FROM Usuario WHERE correo = ?",
    [email],
  );

  if (rows.length === 0) {
    return null;
  }

  const userResult = rows[0];

  return new Usuario(
    userResult.idUsuario,
    userResult.contrasena,
    userResult.nombres,
    userResult.apellidos,
    userResult.correo,
    userResult.telefono,
    userResult.rol,
  );
}

async function create(usuario, connection = null) {
  const executor = connection || pool;

  const [result] = await executor.execute(
    `INSERT INTO Usuario 
      (contrasena, nombres, apellidos, correo, telefono, rol)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      usuario.contrasena,
      usuario.nombres,
      usuario.apellidos,
      usuario.correo,
      usuario.telefono,
      usuario.rol,
    ],
  );

  return result.insertId;
}

module.exports = {
  create,
  existsByEmail,
  findUsuariobyEmail,
};