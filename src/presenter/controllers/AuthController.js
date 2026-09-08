const AuthUseCases = require("../../application/usecases/AuthUseCases");

async function register(req, res) {
  try {
    const pacienteData = req.body;
    
    // Validaciones básicas
    if (!pacienteData.correo || !pacienteData.contrasena || !pacienteData.DNI) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const result = await AuthUseCases.registerPaciente(pacienteData);

    // Auto-login para generar el token
    const loginResult = await AuthUseCases.login(pacienteData.correo, pacienteData.contrasena);
    const { token, usuario } = loginResult;

    res.cookie('token', token, { 
      httpOnly: true, 
      secure: false, 
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000 // 2 horas, igual que el expiresIn del JWT
    });

    return res.status(201).json({
      success: result.success,
      mensaje: result.mensaje,
      usuario
    });
  } catch (error) {
    if (error.message === "El correo ya está registrado") {
      return res.status(409).json({ error: error.message });
    }
    console.error("Error en register:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function login(req, res) {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ error: "Correo y contraseña son requeridos" });
    }

    const result = await AuthUseCases.login(correo, contrasena);
    const { token, usuario } = result;

    res.cookie('token', token, { 
      httpOnly: true, 
      secure: false, 
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000 // 2 horas
    });

    return res.status(200).json({ usuario });
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
