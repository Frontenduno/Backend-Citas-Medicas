const { Paciente } = require('../../../src/domain/entity/Paciente');

describe('Paciente', () => {
  it('debe crear una instancia de Paciente con los valores proporcionados', () => {
    const paciente = new Paciente(1, '74192479', '1990-05-14', 2, null);
    expect(paciente.idPaciente).toBe(1);
    expect(paciente.DNI).toBe('74192479');
    expect(paciente.fecha_nacimiento).toBe('1990-05-14');
    expect(paciente.idUsuario).toBe(2);
    expect(paciente.idContactoEmergencia).toBe(null);
  });
});
