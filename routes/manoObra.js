const express = require('express');
const router = express.Router();
const { getProyectos, getTrabajadoresDelProyecto, getSueldosYLeyes } = require('../controllers/manoObraController');
const { verifyToken } = require('../middleware/auth');

// CU42 - Consolidando Costo de Mano de Obra Mensual
router.get('/proyectos', verifyToken, getProyectos);
router.get('/:codigo/trabajadores', verifyToken, getTrabajadoresDelProyecto);
router.get('/contrato/:rut', verifyToken, getSueldosYLeyes);

module.exports = router;
