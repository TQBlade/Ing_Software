import { Route, Routes } from 'react-router-dom';

// --- 1. Importa TODAS tus páginas ---
// (Corrigiendo las rutas para que sean relativas)
import Acceso from './pages/Acceso.jsx'; // Tu página (Paquete C)
import AuditoriaPage from './pages/AuditoriaPage.jsx';
import DashboardAdmin from './pages/DashboardAdmin.jsx';
import DashboardVigilante from './pages/DashboardVigilante.jsx';
import LoginPage from './pages/LoginPage.jsx';
import PersonasPage from './pages/PersonasPage.jsx';
import ReportesPage from './pages/ReportesPage.jsx';
import VehiculosPage from './pages/VehiculosPage.jsx';

// (Faltarían Alertas.jsx y Calendario.jsx, pero los puedes agregar después)


export default function App() {
  
  // NOTA: El Layout (Sidebar/Navbar) debería ser un componente separado
  // que "envuelva" a las rutas protegidas (tarea de Paquete A).
  // Por ahora, cada Dashboard tiene su propia Navbar, y el Login no tiene ninguna.
  
  return (
    // --- 2. Define las rutas ---
    <Routes>
      
      {/* Rutas de Login (Públicas) */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas de Roles (Protegidas) */}
      <Route path="/dashboard_admin" element={<DashboardAdmin />} />
      <Route path="/dashboard_vigilante" element={<DashboardVigilante />} />

      {/* Rutas de Módulos (Tu Paquete C y Paquete B) */}
      
      {/* Paquete C (Tu página principal de historial/validación) */}
      <Route path="/accesos" element={<Acceso />} />
      {/* Paquete C (Faltaría /alertas - puedes añadirla aquí) */}

      {/* Paquete B (Gestión) */}
      <Route path="/vehiculos" element={<VehiculosPage />} />
      <Route path="/personas" element={<PersonasPage />} />
      <Route path="/reportes" element={<ReportesPage />} />
      <Route path="/auditoria" element={<AuditoriaPage />} />
      {/* Paquete B (Faltaría /calendario - puedes añadirla aquí) */}


      {/* Ruta para "Página no encontrada" */}
      <Route path="*" element={
        <div className="flex h-screen w-screen flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-red-700">404</h1>
          <p className="text-gray-600">Página No Encontrada</p>
        </div>
      } />
      
    </Routes>
  );
}