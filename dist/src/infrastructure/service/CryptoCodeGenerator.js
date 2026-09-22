"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoCodeGenerator = void 0;
const crypto_1 = __importDefault(require("crypto"));
class CryptoCodeGenerator {
    generar() {
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        const codigoHash = this.hashear(codigo);
        return { codigo, codigoHash };
    }
    hashear(codigo) {
        return crypto_1.default.createHash('sha256').update(codigo).digest('hex');
    }
}
exports.CryptoCodeGenerator = CryptoCodeGenerator;
