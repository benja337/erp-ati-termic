const express = require('express');
const router = express.Router();
const { getSolicitudesPendientes, generarOrdenCompra } = require('../controllers/ordenCompraController');
const { verifyToken } = require('../middleware/auth');

// CU35 - Generando Orden de Compra Automáticamente
router.get('/solicitudes-pendientes', verifyToken, getSolicitudesPendientes);
router.post('/generar', verifyToken, generarOrdenCompra);

module.exports = router;
