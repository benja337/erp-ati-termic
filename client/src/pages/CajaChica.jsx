import { useState, useEffect } from 'react';
import { DollarSign, Send } from 'lucide-react';
import api from '../api/axios';
import Toast, { useToast } from '../components/Toast';

export default function CajaChica() {
  const { toasts, addToast, removeToast } = useToast();
  const [proyectos, setProyectos] = useState([]);
  const [saldo, setSaldo] = useState(null);
  const [form, setForm] = useState({
    proyecto_codigo_correlativo: '',
    egreso_caja_chica_monto: '',
    egreso_caja_chica_concepto: '',
    egreso_caja_chica_fecha: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/caja-chica/proyectos')
      .then(r => setProyectos(r.data.data))
      .catch(() => addToast('Error al cargar proyectos', 'error'));
  }, []);

  useEffect(() => {
    if (!form.proyecto_codigo_correlativo) { setSaldo(null); return; }
    api.get(`/caja-chica/saldo/${form.proyecto_codigo_correlativo}`)
      .then(r => setSaldo(r.data.data))
      .catch(() => addToast('Error al calcular saldo', 'error'));
  }, [form.proyecto_codigo_correlativo]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.proyecto_codigo_correlativo || !form.egreso_caja_chica_monto || !form.egreso_caja_chica_concepto) {
      addToast('Completa todos los campos requeridos', 'error'); return;
    }
    const monto = parseFloat(form.egreso_caja_chica_monto);
    if (isNaN(monto) || monto <= 0) {
      addToast('El monto debe ser mayor a 0', 'error'); return;
    }
    if (saldo && monto > saldo.saldo_disponible) {
      addToast(`Saldo insuficiente. Disponible: $${saldo.saldo_disponible.toLocaleString('es-CL')}`, 'error'); return;
    }
    setLoading(true);
    try {
      await api.post('/caja-chica', form);
      addToast('Egreso registrado correctamente', 'success');
      setForm(f => ({ ...f, egreso_caja_chica_monto: '', egreso_caja_chica_concepto: '' }));
      // Refresh saldo
      const r = await api.get(`/caja-chica/saldo/${form.proyecto_codigo_correlativo}`);
      setSaldo(r.data.data);
    } catch (err) {
      addToast(err.response?.data?.error || 'Error al registrar egreso', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fmt = n => n !== undefined ? `$${parseFloat(n).toLocaleString('es-CL')}` : '--';

  return (
    <div className="page-container">
      <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <DollarSign size={20} />
        Egreso de Caja Chica
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

          {saldo && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div className="saldo-box">
                <div className="saldo-label">Presupuesto</div>
                <div style={{ ...saldoValueStyle, color: 'var(--color-text-primary)' }}>{fmt(saldo.presupuesto)}</div>
              </div>
              <div className="saldo-box">
                <div className="saldo-label">Total Egresos</div>
                <div style={{ ...saldoValueStyle, color: 'var(--color-danger)' }}>{fmt(saldo.total_egresos)}</div>
              </div>
              <div className="saldo-box">
                <div className="saldo-label">Saldo Disponible</div>
                <div className="saldo-value">{fmt(saldo.saldo_disponible)}</div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Fecha</label>
            <input
              type="date"
              className="form-input"
              value={form.egreso_caja_chica_fecha}
              onChange={e => setForm(f => ({ ...f, egreso_caja_chica_fecha: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Monto ($)</label>
            <input
              type="number"
              className="form-input"
              placeholder="0"
              min="1"
              value={form.egreso_caja_chica_monto}
              onChange={e => setForm(f => ({ ...f, egreso_caja_chica_monto: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Concepto</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Descripción del gasto..."
              value={form.egreso_caja_chica_concepto}
              onChange={e => setForm(f => ({ ...f, egreso_caja_chica_concepto: e.target.value }))}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Send size={15} />
            {loading ? 'Registrando...' : 'Registrar Egreso'}
          </button>
        </form>
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

const saldoValueStyle = {
  fontSize: 18,
  fontWeight: 700,
  marginTop: 2
};
