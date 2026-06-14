require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');

// Models
const Usuario = require('./models/Usuario');
const Administrador = require('./models/Administrador');
const SupervisorTerreno = require('./models/SupervisorTerreno');
const EstadoProyecto = require('./models/EstadoProyecto');
const Proyecto = require('./models/Proyecto');
const Especialidad = require('./models/Especialidad');
const Trabajador = require('./models/Trabajador');
const BitacoraDiaria = require('./models/BitacoraDiaria');
const EgresoCajaChica = require('./models/EgresoCajaChica');
const IncidenteSSO = require('./models/IncidenteSSO');
const Accidente = require('./models/Accidente');
const HitoTecnico = require('./models/HitoTecnico');
const EvidenciaFotografica = require('./models/EvidenciaFotografica');
const LogAuditoria = require('./models/LogAuditoria');
const Proveedor = require('./models/Proveedor');
const SolicitudMaterial = require('./models/SolicitudMaterial');
const OrdenCompra = require('./models/OrdenCompra');
const DetalleOrdenCompra = require('./models/DetalleOrdenCompra');
const GuiaDespacho = require('./models/GuiaDespacho');
const Factura = require('./models/Factura');
const ParametroSistema = require('./models/ParametroSistema');
const ContratoLaboral = require('./models/ContratoLaboral');
const BitacoraComunicacion = require('./models/BitacoraComunicacion');
const ControlCambioPpto = require('./models/ControlCambioPpto');
const DocumentoLegal = require('./models/DocumentoLegal');
const EquipoHVAC = require('./models/EquipoHVAC');

// Associations
EstadoProyecto.hasMany(Proyecto, { foreignKey: 'estado_proyecto_id' });
Proyecto.belongsTo(EstadoProyecto, { foreignKey: 'estado_proyecto_id' });

HitoTecnico.hasMany(EvidenciaFotografica, { foreignKey: 'hito_tecnico_id' });
EvidenciaFotografica.belongsTo(HitoTecnico, { foreignKey: 'hito_tecnico_id' });

Proyecto.hasMany(SolicitudMaterial, { foreignKey: 'proyecto_codigo_correlativo' });
SolicitudMaterial.belongsTo(Proyecto, { foreignKey: 'proyecto_codigo_correlativo' });

SolicitudMaterial.hasOne(OrdenCompra, { foreignKey: 'solicitud_material_id' });
OrdenCompra.belongsTo(SolicitudMaterial, { foreignKey: 'solicitud_material_id' });

Proveedor.hasMany(OrdenCompra, { foreignKey: 'proveedor_rut' });
OrdenCompra.belongsTo(Proveedor, { foreignKey: 'proveedor_rut' });

OrdenCompra.hasMany(DetalleOrdenCompra, { foreignKey: 'orden_compra_id' });
DetalleOrdenCompra.belongsTo(OrdenCompra, { foreignKey: 'orden_compra_id' });

OrdenCompra.hasMany(GuiaDespacho, { foreignKey: 'orden_compra_id' });
GuiaDespacho.belongsTo(OrdenCompra, { foreignKey: 'orden_compra_id' });

OrdenCompra.hasMany(Factura, { foreignKey: 'orden_compra_id' });
Factura.belongsTo(OrdenCompra, { foreignKey: 'orden_compra_id' });

Trabajador.hasMany(ContratoLaboral, { foreignKey: 'trabajador_rut' });
ContratoLaboral.belongsTo(Trabajador, { foreignKey: 'trabajador_rut' });

Proyecto.hasMany(BitacoraComunicacion, { foreignKey: 'proyecto_codigo_correlativo' });
BitacoraComunicacion.belongsTo(Proyecto, { foreignKey: 'proyecto_codigo_correlativo' });

Proyecto.hasMany(ControlCambioPpto, { foreignKey: 'proyecto_codigo_correlativo' });
ControlCambioPpto.belongsTo(Proyecto, { foreignKey: 'proyecto_codigo_correlativo' });

Proyecto.hasMany(DocumentoLegal, { foreignKey: 'proyecto_codigo_correlativo' });
DocumentoLegal.belongsTo(Proyecto, { foreignKey: 'proyecto_codigo_correlativo' });

Proyecto.hasMany(EquipoHVAC, { foreignKey: 'proyecto_codigo_correlativo' });
EquipoHVAC.belongsTo(Proyecto, { foreignKey: 'proyecto_codigo_correlativo' });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bitacora', require('./routes/bitacora'));
app.use('/api/caja-chica', require('./routes/cajaChica'));
app.use('/api/sso', require('./routes/sso'));
app.use('/api/evidencia', require('./routes/evidencia'));
app.use('/api/proyecto', require('./routes/proyecto'));
app.use('/api/portafolio', require('./routes/portafolio'));
app.use('/api/orden-compra', require('./routes/ordenCompra'));
app.use('/api/factura', require('./routes/factura'));
app.use('/api/control-costos', require('./routes/controlCostos'));
app.use('/api/mano-obra', require('./routes/manoObra'));
app.use('/api/comunicacion', require('./routes/comunicacion'));
app.use('/api/documentos', require('./routes/documentos'));
app.use('/api/poliza', require('./routes/poliza'));
app.use('/api/certificado', require('./routes/certificado'));
app.use('/api/presupuesto', require('./routes/presupuesto'));
app.use('/api/recepcion', require('./routes/recepcion'));
app.use('/api/setup',    require('./routes/setup'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date() } });
});

const PORT = process.env.PORT || 3000;

const { DataTypes } = require('sequelize');

sequelize.authenticate()
  .then(() => {
    console.log('Conexion a MySQL establecida.');
    return sequelize.sync({ alter: false });
  })
  .then(async () => {
    // Migraciones puntuales: agregar columnas que faltan sin borrar datos
    const qi = sequelize.queryInterface;
    const migraciones = [
      { tabla: 'PROYECTO',   columna: 'proveedor_rut',              tipo: { type: DataTypes.STRING(20),  allowNull: true } },
      { tabla: 'TRABAJADOR', columna: 'proyecto_codigo_correlativo', tipo: { type: DataTypes.STRING(50),  allowNull: true } },
      { tabla: 'CONTRATO_LABORAL', columna: 'proyecto_codigo_correlativo', tipo: { type: DataTypes.STRING(50), allowNull: true } },
    ];
    for (const m of migraciones) {
      try {
        await qi.addColumn(m.tabla, m.columna, m.tipo);
        console.log(`Columna ${m.tabla}.${m.columna} agregada.`);
      } catch (_) { /* ya existe, ignorar */ }
    }
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend ERP ATI Termic corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar a la base de datos:', err.message);
    process.exit(1);
  });
