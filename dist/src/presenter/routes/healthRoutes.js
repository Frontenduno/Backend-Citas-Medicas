"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHealthRoutes = createHealthRoutes;
const express_1 = __importDefault(require("express"));
function createHealthRoutes(healthController) {
    const router = express_1.default.Router();
    router.get('/', healthController.check);
    return router;
}
