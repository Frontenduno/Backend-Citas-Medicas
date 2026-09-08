async function createPaciente(connection, pacienteData) {
  const [result] = await connection.execute(
    `INSERT INTO Paciente (DNI, fecha_nacimiento, Usuario_idUsuario, ContactoEmergencia_idContactoEmergencia) 
     VALUES (?, ?, ?, ?)`,
    [
      pacienteData.DNI,
      pacienteData.fecha_nacimiento,
      pacienteData.idUsuario,
      pacienteData.idContactoEmergencia || null,
    ]
  );
  return result.insertId;
}

module.exports = {
  createPaciente,
};
