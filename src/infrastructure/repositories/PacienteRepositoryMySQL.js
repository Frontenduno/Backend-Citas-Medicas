const { pool } = require("../database/PoolConexion");
const { Paciente } = require("../../domain/entity/Paciente");

async function create(paciente, connection = null) {
  const executor = connection || pool;

  const sql = `INSERT INTO Paciente 
    (DNI, fecha_nacimiento, Usuario_idUsuario, ContactoEmergencia_idContactoEmergencia) 
    VALUES (?, ?, ?, ?);`;

  const [result] = await executor.execute(sql, [
    paciente.DNI,
    paciente.fecha_nacimiento,
    paciente.idUsuario,
    null,
  ]);

  return result.insertId;
}

module.exports = {
  create,
};
