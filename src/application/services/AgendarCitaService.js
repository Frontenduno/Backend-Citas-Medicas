const citaRepository = require('../../infrastructure/repositories/CitaRepository');
const horarioRepository = require ('../../infrastructure/repositories/ValidarHorarioMedico');

async function agendarCita(datos) {
    const horarioMedico = await horarioRepository.validarDisponibilidadHorarioMedico(datos.idMedico, datos.fecha, datos.hora );
    

    if (!horarioMedico){
        throw new Error('El médico no tiene disponibilidad en el horario que solicito.');
    }

    const especialidadValida = await citaRepository.medicoPerteneceAEspecialidad(datos.idMedico, datos.idEspecialidad);

    if (!especialidadValida){
        throw new Error('El médico no pertenece a la especialidad que solicito.');
    }

    const citaExistente = await citaRepository.citaYaExiste(datos.idMedico, datos.fecha, datos.hora);
    
    if (citaExistente) {
        throw new Error('Ya existe una cita agendada para el médico en la fecha y hora que solicito.');
    }

    const citaCreada = await citaRepository.crearCita(datos.idPaciente, datos.idMedico, datos.fecha, datos.hora, datos.motivo);

    if (!citaCreada){
        throw new Error('No se pudo crear la cita.');
    }

    return citaCreada;
}

module.exports = {
    AgendarCitaService: agendarCita,
}