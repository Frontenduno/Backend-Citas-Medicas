const bcrypt = require("bcryptjs");

async function encriptarContrasena(contrasena){
    const salt =  await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);
    
    return hashedPassword;
}

async function compararContrasenas(contrasenaIngresada, contrasenaHasheada){
    return await bcrypt.compare(contrasenaIngresada, contrasenaHasheada);
}