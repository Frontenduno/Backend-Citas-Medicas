"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthRoutes = createAuthRoutes;
const express_1 = __importDefault(require("express"));
function createAuthRoutes(authController) {
    const router = express_1.default.Router();
    router.post('/register', authController.register);
    router.post('/login', authController.login);
    return router;
}
