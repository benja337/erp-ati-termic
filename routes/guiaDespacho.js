const express = require('express');
const router = express.Router();
const { getProveedores, getOrdenesCompra, getGuias, crearGuia } = require('../controllers/guiaDespachoController');
const { verifyToken } = require('../middleware/auth');

router.get('/proveedores', verifyToken, getProveedores);
router.get('/ordenes-compra', verifyToken, getOrdenesCompra);
router.get('/', verifyToken, getGuias);
router.post('/', verifyToken, crearGuia);

module.exports = router;
