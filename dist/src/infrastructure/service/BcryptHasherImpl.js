"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BcryptHasherImpl = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class BcryptHasherImpl {
    async encriptarContrasena(contrasena) {
        const salt = await bcryptjs_1.default.genSalt(10);
        return await bcryptjs_1.default.hash(contrasena, salt);
    }
    async compararContrasenas(contrasenaIngresada, contrasenaHasheada) {
        return await bcryptjs_1.default.compare(contrasenaIngresada, contrasenaHasheada);
    }
}
exports.BcryptHasherImpl = BcryptHasherImpl;
