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

// Associations
EstadoProyecto.hasMany(Proyecto, { foreignKey: 'estado_proyecto_id' });
Proyecto.belongsTo(EstadoProyecto, { foreignKey: 'estado_proyecto_id' });

HitoTecnico.hasMany(EvidenciaFotografica, { foreignKey: 'hito_tecnico_id' });
EvidenciaFotografica.belongsTo(HitoTecnico, { foreignKey: 'hito_tecnico_id' });

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

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date() } });
});

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('Conexion a MySQL establecida.');
    return sequelize.sync({ alter: false });
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
