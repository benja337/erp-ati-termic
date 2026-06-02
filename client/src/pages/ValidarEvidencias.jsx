import { useState, useEffect } from 'react';
import { CheckSquare, Check, X, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import Toast, { useToast } from '../components/Toast';
import Badge from '../components/Badge';

export default function ValidarEvidencias() {
  const { toasts, addToast, removeToast } = useToast();
  const [evidencias, setEvidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const r = await api.get('/evidencia/pendientes');
      setEvidencias(r.data.data);
    } catch (err) {
      addToast(err.response?.data?.error || 'Error al cargar evidencias', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const validar = async (id, estado) => {
    setProcesando(id);
    try {
      await api.patch(`/evidencia/${id}/validar`, { estado });
      addToast(`Evidencia ${estado}`, 'success');
      setEvidencias(prev => prev.filter(e => e.evidencia_fotografica_nro !== id));
    } catch (err) {
      addToast(err.response?.data?.error || 'Error al validar', 'error');
    } finally {
      setProcesando(null);
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 0 }}>
          <CheckSquare size={20} />
          Validar Evidencias de Avance
        </h1>
        <button className="btn btn-secondary" onClick={cargar} disabled={loading} style={{ height: 36 }}>
          <RefreshCw size={14} />
          Actualizar
        </button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--color-text-secondary)', padding: 32, textAlign: 'center' }}>Cargando evidencias...</div>
      ) : evidencias.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-secondary)' }}>
          No hay evidencias pendientes de validación.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {evidencias.map(ev => (
            <div key={ev.evidencia_fotografica_nro} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={ev.evidencia_fotografica_url_foto}
                  alt="Evidencia"
                  style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                  <Badge value={ev.evidencia_fotografica_estado_aprobacion} />
                </div>
              </div>

              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  {ev.HitoTecnico?.hito_tecnico_nombre_hito || 'Sin hito'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                  Proyecto: {ev.HitoTecnico?.proyecto_codigo_correlativo}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                  {new Date(ev.evidencia_fotografica_fecha_captura).toLocaleString('es-CL')}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 14 }}>
                  Coord: {parseFloat(ev.evidencia_fotografica_latitud).toFixed(4)}, {parseFloat(ev.evidencia_fotografica_longitud).toFixed(4)}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-success"
                    style={{ flex: 1, height: 36, fontSize: 13, justifyContent: 'center' }}
                    onClick={() => validar(ev.evidencia_fotografica_nro, 'aprobado')}
                    disabled={procesando === ev.evidencia_fotografica_nro}
                  >
                    <Check size={14} /> Aprobar
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ flex: 1, height: 36, fontSize: 13, justifyContent: 'center' }}
                    onClick={() => validar(ev.evidencia_fotografica_nro, 'rechazado')}
                    disabled={procesando === ev.evidencia_fotografica_nro}
                  >
                    <X size={14} /> Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
