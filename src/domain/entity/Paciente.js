class Paciente{
    constructor(idPaciente, DNI, fecha_nacimiento, idUsuario, idContactoEmergencia){
        this.idPaciente = idPaciente;
        this.DNI = DNI;
        this. fecha_nacimiento = fecha_nacimiento;
        this.idUsuario = idUsuario;
        this.idContactoEmergencia = idContactoEmergencia || null;
    }
}