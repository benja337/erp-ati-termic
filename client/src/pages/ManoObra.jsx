import { useState, useEffect } from 'react';
import { Briefcase, User, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import Toast, { useToast } from '../components/Toast';

const fmt = n => n !== undefined && n !== null ? `$${parseFloat(n).toLocaleString('es-CL')}` : '--';

export default function ManoObra() {
  const { toasts, addToast, removeToast } = useToast();
  const [proyectos, setProyectos] = useState([]);
  const [codigoSeleccionado, setCodigoSeleccionado] = useState('');
  const [trabajadores, setTrabajadores] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [loadingTrabajadores, setLoadingTrabajadores] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  useEffect(() => {
    api.get('/mano-obra/proyectos')
      .then(r => setProyectos(r.data.data))
      .catch(() => addToast('Error al cargar proyectos', 'error'));
  }, []);

  useEffect(() => {
    if (!codigoSeleccionado) { setTrabajadores([]); setDetalle(null); return; }
    setLoadingTrabajadores(true);
    setDetalle(null);
    api.get(`/mano-obra/${codigoSeleccionado}/trabajadores`)
      .then(r => setTrabajadores(r.data.data))
      .catch(() => addToast('Error al cargar trabajadores', 'error'))
      .finally(() => setLoadingTrabajadores(false));
  }, [codigoSeleccionado]);

  const cargarDetalle = rut => {
    setLoadingDetalle(true);
    api.get(`/mano-obra/contrato/${rut}`)
      .then(r => setDetalle(r.data.data))
      .catch(() => addToast('Error al cargar detalle del trabajador', 'error'))
      .finally(() => setLoadingDetalle(false));
  };

  const costoTotalProyecto = trabajadores.reduce((acc, _) => acc, 0);

  return (
    <div className="page-container">
      <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Briefcase size={20} />
        Consolidación de Mano de Obra
      </h1>

      <div className="card" style={{ maxWidth: 400, marginBottom: 20 }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Proyecto</label>
          <select
            className="form-select"
            value={codigoSeleccionado}
            onChange={e => setCodigoSeleccionado(e.target.value)}
          >
            <option value="">Selecciona un proyecto...</option>
            {proyectos.map(p => (
              <option key={p.proyecto_codigo_correlativo} value={p.proyecto_codigo_correlativo}>
                {p.proyecto_codigo_correlativo} — {p.proyecto_nombre_obra}
              </option>
            ))}
          </select>
        </div>
      </div>

      {codigoSeleccionado && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20, maxWidth: 900 }}>
          {/* Lista de trabajadores */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Trabajadores ({trabajadores.length})
              </h3>
            </div>
            {loadingTrabajadores ? (
              <p style={{ padding: 20, color: 'var(--color-text-muted)', fontSize: 13 }}>Cargando...</p>
            ) : trabajadores.length === 0 ? (
              <p style={{ padding: 20, color: 'var(--color-text-muted)', fontSize: 13, fontStyle: 'italic' }}>
                Sin trabajadores asignados
              </p>
            ) : (
              trabajadores.map(t => (
                <button
                  key={t.trabajador_rut}
                  onClick={() => cargarDetalle(t.trabajador_rut)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 20px',
                    background: detalle?.trabajador?.trabajador_rut === t.trabajador_rut ? 'var(--color-bg-elevated)' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--color-text-primary)',
                    transition: 'background 0.1s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <User size={14} color="var(--color-text-muted)" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{t.trabajador_nombres}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{t.trabajador_rut}</div>
                    </div>
                  </div>
                  <ChevronRight size={14} color="var(--color-text-muted)" />
                </button>
              ))
            )}
          </div>

          {/* Detalle del trabajador */}
          <div className="card">
            {!detalle && !loadingDetalle && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13, fontStyle: 'italic' }}>
                Selecciona un trabajador para ver sus contratos
              </p>
            )}
            {loadingDetalle && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Cargando detalle...</p>
            )}
            {detalle && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{detalle.trabajador.trabajador_nombres}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>RUT: {detalle.trabajador.trabajador_rut}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{detalle.trabajador.trabajador_correo}</div>
                </div>

                <div style={{
                  background: 'var(--color-bg-elevated)',
                  borderRadius: 4,
                  padding: '12px 16px',
                  marginBottom: 20,
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Costo Total Acumulado
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-green)' }}>
                    {fmt(detalle.costo_total)}
                  </span>
                </div>

                {detalle.contratos.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Sin contratos registrados</p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Inicio</th>
                          <th>Término</th>
                          <th>Sueldo Base</th>
                          <th>Leyes Sociales</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalle.contratos.map((c, i) => (
                          <tr key={i}>
                            <td style={{ fontSize: 13 }}>{c.contrato_laboral_fecha_inicio}</td>
                            <td style={{ fontSize: 13, color: c.contrato_laboral_fecha_termino ? 'inherit' : 'var(--color-text-muted)' }}>
                              {c.contrato_laboral_fecha_termino || 'Vigente'}
                            </td>
                            <td style={{ color: 'var(--color-text-primary)' }}>{fmt(c.contrato_laboral_sueldo_base)}</td>
                            <td style={{ color: 'var(--color-warning)' }}>{fmt(c.contrato_laboral_leyes_sociales)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
