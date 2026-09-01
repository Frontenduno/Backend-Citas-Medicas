const repository = require("../../../src/infrastructure/repositories/UserRepository");

describe("Test de los metodos de repository", () => {
    test('El email verificado debe existir en la base de datos', async () => {
        const result = await repository.existsByEmail("randomEmail@example.com");  
        expect(result).toBe(true);
    })
})