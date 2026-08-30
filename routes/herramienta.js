const express = require('express');
const router = express.Router();
const {
  getHerramientas,
  getTrabajadoresActivos,
  asignar,
  devolver,
  getHistorial
} = require('../controllers/herramientaController');
const { verifyToken } = require('../middleware/auth');

// CU29 - Registrando asignación y trazabilidad de herramientas (Admin Total y Supervisor de Obra)
router.get('/', verifyToken, getHerramientas);
router.get('/trabajadores', verifyToken, getTrabajadoresActivos);
router.get('/historial', verifyToken, getHistorial);
router.post('/asignar', verifyToken, asignar);
router.post('/:id/devolver', verifyToken, devolver);

module.exports = router;
