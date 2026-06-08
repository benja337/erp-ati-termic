const Proyecto = require('../models/Proyecto');
const EstadoProyecto = require('../models/EstadoProyecto');
const Trabajador = require('../models/Trabajador');
const ContratoLaboral = require('../models/ContratoLaboral');

async function getProyectos(req, res) {
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

async function getTrabajadoresDelProyecto(req, res) {
  try {
    const { codigo } = req.params;

    const proyecto = await Proyecto.findByPk(codigo);
    if (!proyecto) {
      return res.status(404).json({ success: false, error: 'Proyecto no encontrado' });
    }

    const trabajadores = await Trabajador.findAll({
      where: { proyecto_codigo_correlativo: codigo }
    });

    return res.json({ success: true, data: trabajadores });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Error al obtener trabajadores' });
  }
}

async function getSueldosYLeyes(req, res) {
  try {
    const { rut } = req.params;

    const trabajador = await Trabajador.findByPk(rut);
    if (!trabajador) {
      return res.status(404).json({ success: false, error: 'Trabajador no encontrado' });
    }

    const contratos = await ContratoLaboral.findAll({
      where: { trabajador_rut: rut },
      order: [['contrato_laboral_fecha_inicio', 'DESC']]
    });

    const costoTotal = contratos.reduce((acc, c) => {
      return acc + parseFloat(c.contrato_laboral_sueldo_base) + parseFloat(c.contrato_laboral_leyes_sociales);
    }, 0);

    return res.json({ success: true, data: { trabajador, contratos, costo_total: costoTotal } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Error al obtener sueldos y leyes' });
  }
}

module.exports = { getProyectos, getTrabajadoresDelProyecto, getSueldosYLeyes };
