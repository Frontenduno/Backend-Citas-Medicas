"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVerificationRoutes = createVerificationRoutes;
const express_1 = __importDefault(require("express"));
function createVerificationRoutes(verificationController) {
    const router = express_1.default.Router();
    router.post('/solicitar', verificationController.solicitar);
    router.post('/confirmar', verificationController.confirmar);
    return router;
}
