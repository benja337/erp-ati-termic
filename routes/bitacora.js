const express = require('express');
const router = express.Router();
const { getProyectos, registrarBitacora } = require('../controllers/bitacoraController');
const { verifyToken } = require('../middleware/auth');

router.get('/proyectos', verifyToken, getProyectos);
router.post('/', verifyToken, registrarBitacora);

module.exports = router;
