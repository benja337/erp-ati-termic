const express = require('express');
const router = express.Router();
const { getProyectos, getSaldo, registrarEgreso } = require('../controllers/cajaChicaController');
const { verifyToken } = require('../middleware/auth');

router.get('/proyectos', verifyToken, getProyectos);
router.get('/saldo/:codigo', verifyToken, getSaldo);
router.post('/', verifyToken, registrarEgreso);

module.exports = router;
