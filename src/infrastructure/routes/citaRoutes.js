const express = require("express");
const router = express.Router();
const citaRepository = require("../repositories/CitaRepository");

// POST /api/citas - Agendar nueva cita
router.post("/", async (req, res) => {
  try {
    const { pacienteId, medicoId, fecha, hora, motivo } = req.body;

    if (!pacienteId || !medicoId || !fecha || !hora) {
      return res.status(400).json({ error: "Campos requeridos: pacienteId, medicoId, fecha, hora" });
    }

    // Verificar disponibilidad antes de crear
    const disponibilidad = await citaRepository.verificarDisponibilidad(medicoId, fecha, hora);
    if (!disponibilidad.disponible) {
      return res.status(409).json({ error: disponibilidad.motivo });
    }

    const resultado = await citaRepository.createCita(pacienteId, medicoId, fecha, hora, motivo || null);
    res.status(201).json(resultado);
  } catch (error) {
    console.error("Error al crear cita:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/citas/:id - Obtener cita por ID
router.get("/:id", async (req, res) => {
  try {
    const resultado = await citaRepository.findCitaById(req.params.id);
    if (!resultado) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }
    res.json(resultado);
  } catch (error) {
    console.error("Error al buscar cita:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/citas/paciente/:pacienteId - Citas de un paciente
router.get("/paciente/:pacienteId", async (req, res) => {
  try {
    const citas = await citaRepository.findCitasByPaciente(req.params.pacienteId);
    res.json(citas);
  } catch (error) {
    console.error("Error al buscar citas del paciente:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/citas/medico/:medicoId - Citas de un médico
router.get("/medico/:medicoId", async (req, res) => {
  try {
    const citas = await citaRepository.findCitasByMedico(req.params.medicoId);
    res.json(citas);
  } catch (error) {
    console.error("Error al buscar citas del médico:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/citas/fecha/:fecha - Citas por fecha
router.get("/fecha/:fecha", async (req, res) => {
  try {
    const citas = await citaRepository.findCitasByFecha(req.params.fecha);
    res.json(citas);
  } catch (error) {
    console.error("Error al buscar citas por fecha:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// PUT /api/citas/:id/estado - Actualizar estado de la cita
router.put("/:id/estado", async (req, res) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ["Pendiente", "Confirmado", "Cancelado"];

    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: `Estado inválido. Valores permitidos: ${estadosValidos.join(", ")}`,
      });
    }

    const actualizado = await citaRepository.updateEstadoCita(req.params.id, estado);
    if (!actualizado) {
      return res.status(404).json({ error: "Ticket de cita no encontrado" });
    }
    res.json({ message: "Estado actualizado correctamente", estado });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// DELETE /api/citas/:id - Eliminar cita
router.delete("/:id", async (req, res) => {
  try {
    const eliminado = await citaRepository.deleteCita(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }
    res.json({ message: "Cita eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar cita:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/citas/disponibilidad/:medicoId/:fecha/:hora - Verificar disponibilidad
router.get("/disponibilidad/:medicoId/:fecha/:hora", async (req, res) => {
  try {
    const { medicoId, fecha, hora } = req.params;
    const resultado = await citaRepository.verificarDisponibilidad(medicoId, fecha, hora);
    res.json(resultado);
  } catch (error) {
    console.error("Error al verificar disponibilidad:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;

