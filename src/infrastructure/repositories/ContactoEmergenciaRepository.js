async function createContactoEmergencia(connection, contactoData) {
  const [result] = await connection.execute(
    `INSERT INTO ContactoEmergencia (telefono, correo, nombres, apellidos, parentesco) 
     VALUES (?, ?, ?, ?, ?)`,
    [
      contactoData.contacto_telefono,
      contactoData.contacto_correo,
      contactoData.contacto_nombres,
      contactoData.contacto_apellidos,
      contactoData.contacto_parentesco,
    ]
  );
  return result.insertId;
}

module.exports = {
  createContactoEmergencia,
};
