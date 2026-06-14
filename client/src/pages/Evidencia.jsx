import { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Send, Image, X, Circle } from 'lucide-react';
import api from '../api/axios';
import Toast, { useToast } from '../components/Toast';

export default function Evidencia() {
  const { toasts, addToast, removeToast } = useToast();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [proyectos, setProyectos] = useState([]);
  const [hitos, setHitos] = useState([]);
  const [preview, setPreview] = useState(null);
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [locating, setLocating] = useState(false);
  const [form, setForm] = useState({ proyecto_codigo_correlativo: '', hito_tecnico_id: '' });
  const [foto, setFoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  useEffect(() => {
    api.get('/bitacora/proyectos')
      .then(r => setProyectos(r.data.data))
      .catch(() => addToast('Error al cargar proyectos', 'error'));

    // Detectar si hay cámara disponible
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        setHasCamera(devices.some(d => d.kind === 'videoinput'));
      }).catch(() => setHasCamera(false));
    }
  }, []);

  useEffect(() => {
    if (!form.proyecto_codigo_correlativo) { setHitos([]); return; }
    api.get(`/evidencia/hito/${form.proyecto_codigo_correlativo}`)
      .then(r => setHitos(r.data.data))
      .catch(() => addToast('Error al cargar hitos', 'error'));
  }, [form.proyecto_codigo_correlativo]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) { addToast('Geolocalización no disponible', 'warning'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        addToast(`Ubicación: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`, 'success');
        setLocating(false);
      },
      () => { addToast('No se pudo obtener ubicación', 'error'); setLocating(false); }
    );
  };

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    setFoto(file);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    getLocation();
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      setCameraOpen(true);
      // Assign stream after modal renders
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      addToast('No se pudo acceder a la cámara. Verifica los permisos del navegador.', 'error');
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      const file = new File([blob], `foto_camara_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setFoto(file);
      setPreview(canvas.toDataURL('image/jpeg'));
      getLocation();
      closeCamera();
    }, 'image/jpeg', 0.85);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.hito_tecnico_id) { addToast('Selecciona un hito técnico', 'error'); return; }
    if (!foto) { addToast('Selecciona una fotografía', 'error'); return; }

    const data = new FormData();
    data.append('hito_tecnico_id', form.hito_tecnico_id);
    data.append('evidencia_fotografica_latitud', coords.lat);
    data.append('evidencia_fotografica_longitud', coords.lng);
    data.append('foto', foto);

    setLoading(true);
    try {
      await api.post('/evidencia', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      addToast('Evidencia cargada con éxito', 'success');
      setFoto(null);
      setPreview(null);
      setForm(f => ({ ...f, hito_tecnico_id: '' }));
    } catch (err) {
      addToast(err.response?.data?.error || 'Error al subir evidencia', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Camera size={20} />
        Cargar Evidencias Fotográficas
      </h1>

      <div className="card" style={{ maxWidth: 680 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Proyecto</label>
            <select
              className="form-select"
              value={form.proyecto_codigo_correlativo}
              onChange={e => setForm(f => ({ ...f, proyecto_codigo_correlativo: e.target.value, hito_tecnico_id: '' }))}
            >
              <option value="">Selecciona un proyecto...</option>
              {proyectos.map(p => (
                <option key={p.proyecto_codigo_correlativo} value={p.proyecto_codigo_correlativo}>
                  {p.proyecto_codigo_correlativo} — {p.proyecto_nombre_obra}
                </option>
              ))}
            </select>
          </div>

          {hitos.length > 0 && (
            <div className="form-group">
              <label className="form-label">Hito Técnico</label>
              <select
                className="form-select"
                value={form.hito_tecnico_id}
                onChange={e => setForm(f => ({ ...f, hito_tecnico_id: e.target.value }))}
              >
                <option value="">Selecciona un hito...</option>
                {hitos.map(h => (
                  <option key={h.hito_tecnico_id} value={h.hito_tecnico_id}>
                    {h.hito_tecnico_nombre_hito} ({h.hito_tecnico_avance_fisico}%)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Fotografía</label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleFile}
            />

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {hasCamera && (
                <button type="button" className="btn btn-secondary" onClick={openCamera}>
                  <Camera size={15} />
                  Usar cámara
                </button>
              )}
              <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                <Image size={15} />
                {foto ? foto.name : 'Elegir archivo'}
              </button>
            </div>

            {preview && (
              <div style={{ marginTop: 12 }}>
                <img
                  src={preview}
                  alt="Vista previa"
                  style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 4, border: '1px solid var(--color-border)', objectFit: 'cover' }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={getLocation} disabled={locating} style={{ flexShrink: 0 }}>
              <MapPin size={15} />
              {locating ? 'Obteniendo...' : 'Obtener ubicación'}
            </button>
            {coords.lat !== 0 && (
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </span>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || !foto || !form.hito_tecnico_id}>
            <Send size={15} />
            {loading ? 'Subiendo...' : 'Subir Evidencia'}
          </button>
        </form>
      </div>

      {/* Modal cámara */}
      {cameraOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
          zIndex: 1000, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ maxWidth: '90vw', maxHeight: '70vh', borderRadius: 8, background: '#000' }}
          />
          <div style={{ display: 'flex', gap: 16 }}>
            <button
              onClick={capturePhoto}
              style={{
                background: 'white', border: 'none', borderRadius: '50%',
                width: 64, height: 64, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title="Capturar foto"
            >
              <Circle size={32} color="#0D1117" fill="#0D1117" />
            </button>
            <button
              onClick={closeCamera}
              style={{
                background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)',
                borderRadius: '50%', width: 64, height: 64, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
              }}
              title="Cancelar"
            >
              <X size={24} />
            </button>
          </div>
          <span style={{ color: '#8B949E', fontSize: 13 }}>Botón blanco = capturar · X = cancelar</span>
        </div>
      )}

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
