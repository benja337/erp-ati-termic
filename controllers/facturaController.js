const multer = require('multer');
const path = require('path');
const fs = require('fs');
const OrdenCompra = require('../models/OrdenCompra');
const Factura = require('../models/Factura');
const LogAuditoria = require('../models/LogAuditoria');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/facturas');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `factura_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  }
});

async function getOrdenesPendientesFact(req, res) {
  try {
    const { Op } = require('sequelize');
    const ordenes = await OrdenCompra.findAll({
      where: { orden_compra_estado: { [Op.ne]: 'Facturado' } }
    });
    return res.json({ success: true, data: ordenes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Error al obtener órdenes pendientes de facturación' });
  }
}

async function vincularFactura(req, res) {
  try {
    const { id } = req.params;
    const { factura_folio, factura_monto_total, factura_fecha } = req.body;

    if (!factura_folio || !factura_monto_total || !factura_fecha) {
      return res.status(400).json({ success: false, error: 'Folio, monto y fecha son requeridos' });
    }

    const orden = await OrdenCompra.findByPk(id);
    if (!orden) {
      return res.status(404).json({ success: false, error: 'Orden de compra no encontrada' });
    }

    const urlPdf = req.file ? `/uploads/facturas/${req.file.filename}` : null;

    const factura = await Factura.create({
      factura_folio,
      factura_monto_total: parseFloat(factura_monto_total),
      factura_fecha,
      factura_url_pdf: urlPdf,
      orden_compra_id: parseInt(id)
    });

    await orden.update({ orden_compra_estado: 'Facturado' });

    await LogAuditoria.create({
      log_auditoria_fecha_hora: new Date(),
      log_auditoria_accion: `Factura ${factura_folio} vinculada a orden de compra ${id}`,
      log_auditoria_modulo: 'FACTURA',
      usuario_rut: req.user.rut
    });

    return res.status(201).json({ success: true, data: factura });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Error al vincular factura' });
  }
}

module.exports = { getOrdenesPendientesFact, vincularFactura, upload };
