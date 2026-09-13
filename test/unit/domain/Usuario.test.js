const { Usuario } = require('../../../src/domain/entity/Usuario');

describe('Usuario', () => {
  it('debe crear una instancia de Usuario con los valores proporcionados', () => {
    const usuario = new Usuario(1, 'hash', 'Juan', 'Perez', 'juan@mail.com', '999999999', 'PACIENTE');
    expect(usuario.idUsuario).toBe(1);
    expect(usuario.contrasena).toBe('hash');
    expect(usuario.nombres).toBe('Juan');
    expect(usuario.apellidos).toBe('Perez');
    expect(usuario.correo).toBe('juan@mail.com');
    expect(usuario.telefono).toBe('999999999');
    expect(usuario.rol).toBe('PACIENTE');
  });
});
