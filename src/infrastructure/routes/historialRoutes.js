const express = require("express");
const router = express.Router();
const historialRepository = require("../repositories/HistorialRepository");

// POST /api/historiales - Registrar historial clínico
router.post("/", async (req, res) => {
  try {
    const { citaId, diagnostico, tratamiento, observaciones } = req.body;

    if (!citaId || !diagnostico) {
      return res.status(400).json({ error: "Campos requeridos: citaId, diagnostico" });
    }

    const historial = await historialRepository.createHistorial(
      citaId, diagnostico, tratamiento, observaciones,
    );
    res.status(201).json(historial);
  } catch (error) {
    // Manejar error de duplicado (UNIQUE constraint en Cita_idCita)
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Ya existe un historial clínico para esta cita" });
    }
    console.error("Error al crear historial:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/historiales/cita/:citaId - Historial por cita
router.get("/cita/:citaId", async (req, res) => {
  try {
    const historial = await historialRepository.findHistorialByCita(req.params.citaId);
    if (!historial) {
      return res.status(404).json({ error: "Historial no encontrado para esta cita" });
    }
    res.json(historial);
  } catch (error) {
    console.error("Error al buscar historial:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/historiales/paciente/:pacienteId - Historiales de un paciente
router.get("/paciente/:pacienteId", async (req, res) => {
  try {
    const historiales = await historialRepository.findHistorialesByPaciente(req.params.pacienteId);
    res.json(historiales);
  } catch (error) {
    console.error("Error al buscar historiales del paciente:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// PUT /api/historiales/:id - Actualizar historial
router.put("/:id", async (req, res) => {
  try {
    const { diagnostico, tratamiento, observaciones } = req.body;

    if (!diagnostico) {
      return res.status(400).json({ error: "Campo requerido: diagnostico" });
    }

    const actualizado = await historialRepository.updateHistorial(
      req.params.id, diagnostico, tratamiento, observaciones,
    );

    if (!actualizado) {
      return res.status(404).json({ error: "Historial no encontrado" });
    }
    res.json({ message: "Historial actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar historial:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// DELETE /api/historiales/:id - Eliminar historial
router.delete("/:id", async (req, res) => {
  try {
    const eliminado = await historialRepository.deleteHistorial(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ error: "Historial no encontrado" });
    }
    res.json({ message: "Historial eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar historial:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;

