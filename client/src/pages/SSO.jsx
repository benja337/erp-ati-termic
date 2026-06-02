import { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Trash2, Send } from 'lucide-react';
import api from '../api/axios';
import Toast, { useToast } from '../components/Toast';
import Badge from '../components/Badge';

const GRAVEDADES = ['leve', 'grave', 'fatal'];

export default function SSO() {
  const { toasts, addToast, removeToast } = useToast();
  const [proyectos, setProyectos] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [form, setForm] = useState({
    proyecto_codigo_correlativo: '',
    incidente_sso_descripcion: '',
    incidente_sso_gravedad: 'leve',
    incidente_sso_fecha_hora: new Date().toISOString().slice(0, 16)
  });
  const [involucrados, setInvolucrados] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/sso/proyectos')
      .then(r => setProyectos(r.data.data))
      .catch(() => addToast('Error al cargar proyectos', 'error'));
  }, []);

  useEffect(() => {
    if (!form.proyecto_codigo_correlativo) { setTrabajadores([]); return; }
    api.get(`/sso/trabajadores/${form.proyecto_codigo_correlativo}`)
      .then(r => setTrabajadores(r.data.data))
      .catch(() => addToast('Error al cargar trabajadores', 'error'));
  }, [form.proyecto_codigo_correlativo]);

  const addInvolucrado = () => {
    setInvolucrados(prev => [...prev, { rut: '', dias_perdidos: 0, riesgo_potencial: '' }]);
  };

  const removeInvolucrado = idx => {
    setInvolucrados(prev => prev.filter((_, i) => i !== idx));
  };

  const updateInvolucrado = (idx, field, value) => {
    setInvolucrados(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.proyecto_codigo_correlativo || !form.incidente_sso_descripcion || !form.incidente_sso_gravedad) {
      addToast('Completa todos los campos requeridos', 'error'); return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    data.append('trabajadores_involucrados', JSON.stringify(involucrados));

    setLoading(true);
    try {
      const res = await api.post('/sso/incidente', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      addToast(`Incidente SSO registrado. Folio #${res.data.data.incidente_sso_id}`, 'success');
      setForm(f => ({ ...f, incidente_sso_descripcion: '', incidente_sso_gravedad: 'leve', proyecto_codigo_correlativo: '' }));
      setInvolucrados([]);
    } catch (err) {
      addToast(err.response?.data?.error || 'Error al registrar incidente', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertTriangle size={20} />
        Registrar Incidente SSO
      </h1>

      <div className="card" style={{ maxWidth: 720 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Proyecto</label>
              <select
                className="form-select"
                value={form.proyecto_codigo_correlativo}
                onChange={e => setForm(f => ({ ...f, proyecto_codigo_correlativo: e.target.value }))}
              >
                <option value="">Selecciona...</option>
                {proyectos.map(p => (
                  <option key={p.proyecto_codigo_correlativo} value={p.proyecto_codigo_correlativo}>
                    {p.proyecto_codigo_correlativo}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Gravedad</label>
              <select
                className="form-select"
                value={form.incidente_sso_gravedad}
                onChange={e => setForm(f => ({ ...f, incidente_sso_gravedad: e.target.value }))}
              >
                {GRAVEDADES.map(g => (
                  <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Fecha y Hora del Incidente</label>
            <input
              type="datetime-local"
              className="form-input"
              value={form.incidente_sso_fecha_hora}
              onChange={e => setForm(f => ({ ...f, incidente_sso_fecha_hora: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción del Incidente</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Describa qué ocurrió, lugar exacto, condiciones del ambiente..."
              value={form.incidente_sso_descripcion}
              onChange={e => setForm(f => ({ ...f, incidente_sso_descripcion: e.target.value }))}
            />
          </div>

          {/* Trabajadores involucrados */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span className="form-label" style={{ margin: 0 }}>Trabajadores Involucrados (opcional)</span>
              <button type="button" className="btn btn-secondary" style={{ height: 32, padding: '0 12px', fontSize: 13 }} onClick={addInvolucrado}>
                <Plus size={14} /> Agregar
              </button>
            </div>

            {involucrados.map((inv, idx) => (
              <div key={idx} style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 4, padding: '12px 14px', marginBottom: 8,
                display: 'grid', gridTemplateColumns: '1fr 80px 1fr auto', gap: 10, alignItems: 'end'
              }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 11 }}>RUT Trabajador</label>
                  <select
                    className="form-select"
                    value={inv.rut}
                    onChange={e => updateInvolucrado(idx, 'rut', e.target.value)}
                  >
                    <option value="">Selecciona...</option>
                    {trabajadores.map(t => (
                      <option key={t.trabajador_rut} value={t.trabajador_rut}>
                        {t.trabajador_rut} — {t.trabajador_nombres}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 11 }}>Días perdidos</label>
                  <input type="number" min="0" className="form-input" value={inv.dias_perdidos}
                    onChange={e => updateInvolucrado(idx, 'dias_perdidos', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 11 }}>Riesgo potencial</label>
                  <input type="text" className="form-input" placeholder="Describe el riesgo..."
                    value={inv.riesgo_potencial}
                    onChange={e => updateInvolucrado(idx, 'riesgo_potencial', e.target.value)} />
                </div>
                <button type="button" onClick={() => removeInvolucrado(idx)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 4, alignSelf: 'center' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Send size={15} />
            {loading ? 'Registrando...' : 'Registrar Incidente'}
          </button>
        </form>
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
