import express from "express";
import { createPacienteController } from "../controllers/PacienteController";

export function createPacienteRoutes(
  pacienteController: ReturnType<typeof createPacienteController>,
) {
  const router = express.Router();
  router.post("/register", pacienteController.registrarContacto);
  return router;
}
