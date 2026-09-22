import { Paciente } from '../../../src/domain/entities/Paciente';

describe('Paciente', () => {
  it('debe crear una instancia de Paciente con los valores proporcionados', () => {
    const paciente = new Paciente(1, 2);
    expect(paciente.idPaciente).toBe(1);
    expect(paciente.idUsuario).toBe(2);
  });
});
