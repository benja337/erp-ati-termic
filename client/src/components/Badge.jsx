const BADGE_STYLES = {
  'En Ejecución': { bg: '#1A3A1A', color: '#5DB835', border: '#5DB835' },
  'Planificación': { bg: '#3A2A00', color: '#D4930A', border: '#D4930A' },
  'Finalizado':    { bg: '#1A2A3A', color: '#4A90D9', border: '#4A90D9' },
  'pendiente':     { bg: '#3A2A00', color: '#D4930A', border: '#D4930A' },
  'aprobado':      { bg: '#1A3A1A', color: '#5DB835', border: '#5DB835' },
  'rechazado':     { bg: '#3A1010', color: '#C0392B', border: '#C0392B' },
  'leve':          { bg: '#1A2A3A', color: '#4A90D9', border: '#4A90D9' },
  'grave':         { bg: '#3A2A00', color: '#D4930A', border: '#D4930A' },
  'fatal':         { bg: '#3A1010', color: '#C0392B', border: '#C0392B' }
};

const DEFAULT_STYLE = { bg: '#1C2128', color: '#8B949E', border: '#2D3748' };

export default function Badge({ value }) {
  const style = BADGE_STYLES[value] || DEFAULT_STYLE;
  return (
    <span style={{
      display: 'inline-block',
      background: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`,
      borderRadius: '3px',
      padding: '2px 8px',
      fontSize: '12px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap'
    }}>
      {value}
    </span>
  );
}
