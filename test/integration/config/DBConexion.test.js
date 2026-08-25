const DBConexion = require('../../../src/configuration/DatabaseConexion');
const expect = require('expect');

describe('Test de la conexion a la base de datos', () => {
  test('Debe conectarse a la base de datos', () => {
    expect(DBConexion).toBeDefined();
  });
});