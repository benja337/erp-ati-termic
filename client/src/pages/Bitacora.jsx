import { useState, useEffect } from 'react';
import { BookOpen, Send } from 'lucide-react';
import api from '../api/axios';
import Toast, { useToast } from '../components/Toast';
import Badge from '../components/Badge';

export default function Bitacora() {
  const { toasts, addToast, removeToast } = useToast();
  const [proyectos, setProyectos] = useState([]);
  const [form, setForm] = useState({
    proyecto_codigo_correlativo: '',
    bitacora_diaria_descripcion_actividad: '',
    bitacora_diaria_fecha: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/bitacora/proyectos')
      .then(r => setProyectos(r.data.data))
      .catch(() => addToast('Error al cargar proyectos', 'error'));
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.proyecto_codigo_correlativo) {
      addToast('Selecciona un proyecto', 'error'); return;
    }
    if (form.bitacora_diaria_descripcion_actividad.trim().length < 10) {
      addToast('La descripción debe tener al menos 10 caracteres', 'error'); return;
    }
    setLoading(true);
    try {
      await api.post('/bitacora', form);
      addToast('Bitácora registrada exitosamente', 'success');
      setForm(f => ({ ...f, bitacora_diaria_descripcion_actividad: '' }));
    } catch (err) {
      addToast(err.response?.data?.error || 'Error al registrar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const proyectoSeleccionado = proyectos.find(p => p.proyecto_codigo_correlativo === form.proyecto_codigo_correlativo);

  return (
    <div className="page-container">
      <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <BookOpen size={20} />
        Bitácora Técnica Diaria
      </h1>

      <div className="card" style={{ maxWidth: 680 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Proyecto</label>
            <select
              className="form-select"
              value={form.proyecto_codigo_correlativo}
              onChange={e => setForm(f => ({ ...f, proyecto_codigo_correlativo: e.target.value }))}
            >
              <option value="">Selecciona un proyecto...</option>
              {proyectos.map(p => (
                <option key={p.proyecto_codigo_correlativo} value={p.proyecto_codigo_correlativo}>
                  {p.proyecto_codigo_correlativo} — {p.proyecto_nombre_obra}
                </option>
              ))}
            </select>
          </div>

          {proyectoSeleccionado && (
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Estado:</span>
              <Badge value={proyectoSeleccionado.EstadoProyecto?.estado_proyecto_nombre} />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Fecha</label>
            <input
              type="date"
              className="form-input"
              value={form.bitacora_diaria_fecha}
              onChange={e => setForm(f => ({ ...f, bitacora_diaria_fecha: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción de Actividades</label>
            <textarea
              className="form-textarea"
              rows={5}
              placeholder="Describa detalladamente las actividades realizadas hoy en terreno..."
              value={form.bitacora_diaria_descripcion_actividad}
              onChange={e => setForm(f => ({ ...f, bitacora_diaria_descripcion_actividad: e.target.value }))}
            />
            <span style={{ fontSize: 12, color: form.bitacora_diaria_descripcion_actividad.length < 10 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
              {form.bitacora_diaria_descripcion_actividad.length} caracteres (mínimo 10)
            </span>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Send size={15} />
            {loading ? 'Registrando...' : 'Registrar Bitácora'}
          </button>
        </form>
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
