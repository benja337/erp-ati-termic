const GuiaDespacho = require('../models/GuiaDespacho');
const LogAuditoria = require('../models/LogAuditoria');

const RADIO_MAXIMO_METROS = 500;

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getGuiasPendientes(req, res) {
  try {
    const guias = await GuiaDespacho.findAll({
      where: { guia_despacho_estado: 'Pendiente' }
    });
    return res.json({ success: true, data: guias });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Error al obtener guías pendientes' });
  }
}

async function confirmarRecepcion(req, res) {
  try {
    const { id } = req.params;
    const { latitud_supervisor, longitud_supervisor, latitud_obra, longitud_obra } = req.body;

    if (!latitud_supervisor || !longitud_supervisor || !latitud_obra || !longitud_obra) {
      return res.status(400).json({ success: false, error: 'Coordenadas del supervisor y de la obra son requeridas' });
    }

    const guia = await GuiaDespacho.findByPk(id);
    if (!guia) {
      return res.status(404).json({ success: false, error: 'Guía de despacho no encontrada' });
    }

    const distancia = calcularDistancia(
      parseFloat(latitud_supervisor),
      parseFloat(longitud_supervisor),
      parseFloat(latitud_obra),
      parseFloat(longitud_obra)
    );

    const fueraDeRango = distancia > RADIO_MAXIMO_METROS;
    const ubicacionVerificada = !fueraDeRango;

    await guia.update({
      guia_despacho_estado: 'Recibido',
      guia_despacho_ubicacion_verificada: ubicacionVerificada,
      guia_despacho_latitud_recepcion: parseFloat(latitud_supervisor),
      guia_despacho_longitud_recepcion: parseFloat(longitud_supervisor)
    });

    await LogAuditoria.create({
      log_auditoria_fecha_hora: new Date(),
      log_auditoria_accion: `Recepción de guía ${id} ${ubicacionVerificada ? 'verificada' : 'FUERA DE RANGO'} (distancia: ${Math.round(distancia)}m)`,
      log_auditoria_modulo: 'RECEPCION',
      usuario_rut: req.user.rut
    });

    return res.json({
      success: true,
      data: {
        guia_despacho_id: parseInt(id),
        distancia_metros: Math.round(distancia),
        fuera_de_rango: fueraDeRango,
        ubicacion_verificada: ubicacionVerificada
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Error al confirmar recepción' });
  }
}

module.exports = { getGuiasPendientes, confirmarRecepcion };
