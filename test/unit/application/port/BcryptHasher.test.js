const { BcryptHasherImpl } = require('../../../../src/infrastructure/service/BcryptHasherImpl');

jest.mock('bcryptjs');

describe('BcryptHasherImpl', () => {
  const bcrypt = require('bcryptjs');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe encriptar una contrasena', async () => {
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashed');

    const hasher = new BcryptHasherImpl();
    const result = await hasher.encriptarContrasena('password');

    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('password', 'salt');
    expect(result).toBe('hashed');
  });

  it('debe comparar contrasenas correctamente', async () => {
    bcrypt.compare.mockResolvedValue(true);

    const hasher = new BcryptHasherImpl();
    const result = await hasher.compararContrasenas('password', 'hashed');

    expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed');
    expect(result).toBe(true);
  });
});
