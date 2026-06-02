import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/index.css';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Bitacora from './pages/Bitacora';
import CajaChica from './pages/CajaChica';
import SSO from './pages/SSO';
import Evidencia from './pages/Evidencia';
import ValidarEvidencias from './pages/ValidarEvidencias';

function PrivateLayout({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function AdminRoute({ children }) {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  if (usuario.rol !== 'admin') return <Navigate to="/bitacora" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/bitacora" element={<PrivateLayout><Bitacora /></PrivateLayout>} />
        <Route path="/caja-chica" element={<PrivateLayout><CajaChica /></PrivateLayout>} />
        <Route path="/sso" element={<PrivateLayout><SSO /></PrivateLayout>} />
        <Route path="/evidencia" element={<PrivateLayout><Evidencia /></PrivateLayout>} />
        <Route path="/validar" element={<PrivateLayout><AdminRoute><ValidarEvidencias /></AdminRoute></PrivateLayout>} />
        <Route path="/" element={<Navigate to="/bitacora" replace />} />
        <Route path="*" element={<Navigate to="/bitacora" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
