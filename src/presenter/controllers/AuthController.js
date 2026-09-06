const AuthUseCases = require("../../application/usecases/Authentication/AuthUseCases");

async function register(req, res) {
  try {
    const {
      correo,
      contrasena,
      nombres,
      apellidos,
      telefono,
      DNI,
      fecha_nacimiento,
    } = req.body;
    const pacienteData = {
      correo,
      contrasena,
      nombres,
      apellidos,
      telefono,
      DNI,
      fecha_nacimiento,
    };

    // Validaciones básicas
    if (!pacienteData.correo || !pacienteData.contrasena || !pacienteData.DNI) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const result = await AuthUseCases.registerPaciente(pacienteData);
    return res.status(201).json(result);
  } catch (error) {
    if (error.message === "El correo ya está registrado") {
      return res.status(409).json({ error: error.message });
    }
    console.log(req.body);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function login(req, res) {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res
        .status(400)
        .json({ error: "Correo y contraseña son requeridos" });
    }

    const result = await AuthUseCases.login(correo, contrasena);
    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "Credenciales inválidas") {
      return res.status(401).json({ error: error.message });
    }
    console.error("Error en login:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = {
  register,
  login,
};
