const { JwtGeneratorImpl } = require('../../../../src/infrastructure/service/JwtGeneratorImpl');

jest.mock('jsonwebtoken');

describe('JwtGeneratorImpl', () => {
  const jwt = require('jsonwebtoken');

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.JWT_SECRET;
  });

  it('debe firmar credenciales con el secreto por defecto', () => {
    jwt.sign.mockReturnValue('token123');

    const generator = new JwtGeneratorImpl();
    const result = generator.firmarCredenciales({ userId: 1 });

    expect(jwt.sign).toHaveBeenCalledWith({ userId: 1 }, 'secreto_super_seguro_123', { expiresIn: '1h' });
    expect(result).toBe('token123');
  });

  it('debe firmar credenciales con tiempo de expiracion personalizado', () => {
    jwt.sign.mockReturnValue('token456');

    const generator = new JwtGeneratorImpl();
    const result = generator.firmarCredenciales({ userId: 1 }, '2h');

    expect(jwt.sign).toHaveBeenCalledWith({ userId: 1 }, 'secreto_super_seguro_123', { expiresIn: '2h' });
    expect(result).toBe('token456');
  });
});
