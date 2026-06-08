const express = require('express');
const router = express.Router();
const { getProyectosConPresupuesto, getGastosReales, getUmbralDesviacion } = require('../controllers/controlCostosController');
const { verifyToken } = require('../middleware/auth');

// CU41 - Graficando Desviación de Costos
router.get('/proyectos', verifyToken, getProyectosConPresupuesto);
router.get('/:codigo/gastos', verifyToken, getGastosReales);
router.get('/parametro/umbral', verifyToken, getUmbralDesviacion);

module.exports = router;
