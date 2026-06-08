const Proyecto = require('../models/Proyecto');
const EquipoHVAC = require('../models/EquipoHVAC');
const DocumentoLegal = require('../models/DocumentoLegal');
const EstadoProyecto = require('../models/EstadoProyecto');
const LogAuditoria = require('../models/LogAuditoria');

async function generarCertificado(req, res) {
  try {
    const { proyecto_codigo_correlativo, datos_certificado } = req.body;

    if (!proyecto_codigo_correlativo || !datos_certificado) {
      return res.status(400).json({ success: false, error: 'Proyecto y datos del certificado son requeridos' });
    }

    const { tecnico_nombre, fecha_instalacion, observaciones } = datos_certificado;
    if (!tecnico_nombre || !fecha_instalacion) {
      return res.status(400).json({ success: false, error: 'Nombre del técnico y fecha de instalación son obligatorios' });
    }

    const proyecto = await Proyecto.findByPk(proyecto_codigo_correlativo, {
      include: [{ model: EstadoProyecto, attributes: ['estado_proyecto_nombre'] }]
    });
    if (!proyecto) {
      return res.status(404).json({ success: false, error: 'Proyecto no encontrado' });
    }

    const equipos = await EquipoHVAC.findAll({
      where: { proyecto_codigo_correlativo }
    });

    const urlPdf = `/uploads/documentos/certificado_${proyecto_codigo_correlativo}_${Date.now()}.pdf`;

    const certificado = await DocumentoLegal.create({
      documento_legal_tipo: 'certificado',
      documento_legal_url_pdf: urlPdf,
      documento_legal_fecha_emision: new Date().toISOString().split('T')[0],
      documento_legal_fecha_vencimiento: null,
      documento_legal_estado: 'PendienteFirma',
      trabajador_rut: null,
      proyecto_codigo_correlativo
    });

    await LogAuditoria.create({
      log_auditoria_fecha_hora: new Date(),
      log_auditoria_accion: `Certificado de instalación generado para proyecto ${proyecto_codigo_correlativo}`,
      log_auditoria_modulo: 'CERTIFICADO',
      usuario_rut: req.user.rut
    });

    return res.status(201).json({
      success: true,
      data: { certificado, proyecto, equipos, datos_certificado }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Error al generar certificado' });
  }
}

module.exports = { generarCertificado };
