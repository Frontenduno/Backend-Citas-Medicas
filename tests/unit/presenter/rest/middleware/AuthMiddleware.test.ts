import { Response, NextFunction } from 'express';
import { createAuthMiddleware, AuthenticatedRequest } from '../../../../../src/presenter/rest/middleware/AuthMiddleware';
import { crearMockJwtGenerator } from '../../../helpers/mocks';
import { Rol } from '../../../../../src/domain/enum/Rol';

describe('AuthMiddleware Unit Tests', () => {
  let jwtGenerator: ReturnType<typeof crearMockJwtGenerator>;
  let middleware: ReturnType<typeof createAuthMiddleware>;
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    jwtGenerator = crearMockJwtGenerator();
    middleware = createAuthMiddleware(jwtGenerator);
    mockReq = {
      cookies: {},
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('debe permitir acceso y adjuntar usuario cuando el access_token en cookie es válido', async () => {
    mockReq.cookies = { access_token: 'valid.token' };
    const payload = { correo: 'user@test.com', idUsuario: '1', rol: Rol.PACIENTE };
    jwtGenerator.decodificarToken.mockResolvedValue(payload);

    await middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

    expect(mockReq.usuario).toEqual(payload);
    expect(mockNext).toHaveBeenCalled();
  });

  it('debe permitir acceso cuando el token viene en header Authorization Bearer', async () => {
    mockReq.headers = { authorization: 'Bearer header.token' };
    const payload = { correo: 'user@test.com', idUsuario: '2', rol: Rol.MEDICO };
    jwtGenerator.decodificarToken.mockResolvedValue(payload);

    await middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

    expect(mockReq.usuario).toEqual(payload);
    expect(mockNext).toHaveBeenCalled();
  });

  it('debe retornar 401 NO_TOKEN si no hay token en cookies ni en headers', async () => {
    await middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'NO_TOKEN' })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debe retornar 401 TOKEN_EXPIRED si el access_token es inválido o expiró', async () => {
    mockReq.cookies = { access_token: 'expired.token' };
    jwtGenerator.decodificarToken.mockRejectedValue(new Error('jwt expired'));

    await middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'TOKEN_EXPIRED' })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });
});
