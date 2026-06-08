const sequelize = require('../config/database');
const Proyecto = require('../models/Proyecto');
const EstadoProyecto = require('../models/EstadoProyecto');
const ParametroSistema = require('../models/ParametroSistema');

async function getProyectosConPresupuesto(req, res) {
  try {
    const proyectos = await Proyecto.findAll({
      include: [{ model: EstadoProyecto, attributes: ['estado_proyecto_nombre'] }]
    });
    return res.json({ success: true, data: proyectos });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Error al obtener proyectos' });
  }
}

async function getGastosReales(req, res) {
  try {
    const { codigo } = req.params;
    const { periodo } = req.query;

    const proyecto = await Proyecto.findByPk(codigo);
    if (!proyecto) {
      return res.status(404).json({ success: false, error: 'Proyecto no encontrado' });
    }

    let query = `
      SELECT COALESCE(SUM(f.factura_monto_total), 0) AS total_gastos
      FROM FACTURA f
      INNER JOIN ORDEN_COMPRA oc ON f.orden_compra_id = oc.orden_compra_id
      WHERE oc.proyecto_codigo_correlativo = :codigo
    `;
    const replacements = { codigo };

    if (periodo) {
      query += ' AND DATE_FORMAT(f.factura_fecha, "%Y-%m") = :periodo';
      replacements.periodo = periodo;
    }

    const [result] = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    const gastos_reales = parseFloat(result.total_gastos) || 0;
    const presupuesto = parseFloat(proyecto.proyecto_presupuesto_asignado) || 0;
    const varianza = presupuesto - gastos_reales;
    const porcentaje_desviacion = presupuesto > 0 ? ((gastos_reales - presupuesto) / presupuesto) * 100 : 0;

    return res.json({
      success: true,
      data: { presupuesto, gastos_reales, varianza, porcentaje_desviacion }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Error al obtener gastos reales' });
  }
}

async function getUmbralDesviacion(req, res) {
  try {
    const parametro = await ParametroSistema.findOne({
      where: { parametro_sistema_clave: 'umbral_desviacion' }
    });
    if (!parametro) {
      return res.status(404).json({ success: false, error: 'Parámetro umbral_desviacion no encontrado' });
    }
    return res.json({ success: true, data: parametro });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Error al obtener umbral de desviación' });
  }
}

module.exports = { getProyectosConPresupuesto, getGastosReales, getUmbralDesviacion };
