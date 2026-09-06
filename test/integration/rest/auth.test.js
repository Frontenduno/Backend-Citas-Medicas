const request = require("supertest");
const authRoutes = require("../../../src/presenter/routes/authRoutes");
const {
  closeConnection,
} = require("../../../src/infrastructure/database/PoolConexion");

const express = require("express");
const app = express();

app.use(express.json());

app.use("/auth", authRoutes);

describe("Pruebas de Integración para Endpoints de Autenticación (Auth)", () => {
  // Usamos Date.now() para generar correos únicos y evitar error de 'Correo ya registrado'
  // en la base de datos MySQL en ejecuciones consecutivas
  const timestamp = Date.now();
  const testUser = {
    correo: `juan.perez${timestamp}@example.com`,
    contrasena: "secreta123",
    nombres: "Juan",
    apellidos: "Perez",
    telefono: "987654321",
    DNI: `123${timestamp.toString().slice(-5)}`,
    fecha_nacimiento: "1990-01-01",
  };

  afterAll(async () => {
    // Cerramos el pool de conexiones a la base de datos tras correr todas las pruebas
    await closeConnection();
  });

  describe("POST /auth/register", () => {
    it("debería registrar un nuevo paciente y devolver status 201", async () => {
      const res = await request(app).post("/auth/register").send(testUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("idUsuario");
      expect(res.body).toHaveProperty(
        "mensaje",
        "Paciente registrado correctamente",
      );
    });

    it("debería retornar error 409 si intentamos registrar el mismo correo", async () => {
      const res = await request(app).post("/auth/register").send(testUser);

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty("error", "El correo ya está registrado");
    });

    it("debería retornar error 400 si faltan campos obligatorios", async () => {
      const incompleteUser = { correo: "incompleto@example.com" }; // Faltan contrasena y DNI
      const res = await request(app)
        .post("/auth/register")
        .send(incompleteUser);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("error", "Faltan campos obligatorios");
    });
  });

  describe("POST /auth/login", () => {
    it("debería iniciar sesión correctamente y retornar un JWT", async () => {
      const res = await request(app).post("/auth/login").send({
        correo: testUser.correo,
        contrasena: testUser.contrasena,
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.usuario).toHaveProperty("correo", testUser.correo);
      expect(res.body.usuario).toHaveProperty("rol", "PACIENTE");
    });

    it("debería retornar error 401 si la contraseña es incorrecta", async () => {
      const res = await request(app).post("/auth/login").send({
        correo: testUser.correo,
        contrasena: "clave_equivocada",
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("error", "Credenciales inválidas");
    });

    it("debería retornar error 401 si el usuario no existe", async () => {
      const res = await request(app).post("/auth/login").send({
        correo: "correo.inexistente@example.com",
        contrasena: "123456",
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("error", "Credenciales inválidas");
    });
  });
});
