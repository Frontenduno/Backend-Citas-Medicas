const { getConnection } = require("../database/PoolConexion");

async function validarDisponibilidadHorarioMedico(idMedico, fecha, hora) {
    const connection = await getConnection();
    const diasSemana = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
    ];
    const diaSemana = diasSemana[new Date(`${fecha}T00:00:00Z`).getUTCDay()];

    try {
        const [rows] = await connection.execute(
            `SELECT idHorario
             FROM Horario
             WHERE Medico_idMedico = ?
               AND diaSemana = ?
               AND horaInicio <= ?
               AND horaFin > ?`,
            [idMedico, diaSemana, hora, hora],
        );
    
        return rows.length > 0;
    } finally {
        connection.release();
    }
}

module.exports = {
    validarDisponibilidadHorarioMedico,
};