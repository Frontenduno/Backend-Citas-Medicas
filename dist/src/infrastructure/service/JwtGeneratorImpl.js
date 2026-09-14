"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtGeneratorImpl = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_123';
class JwtGeneratorImpl {
    firmarCredenciales(payload, tiempoExpiracion) {
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: tiempoExpiracion || '1h' });
    }
}
exports.JwtGeneratorImpl = JwtGeneratorImpl;
