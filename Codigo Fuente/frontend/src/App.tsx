import { Route, Routes } from 'react-router-dom';

// --- 1. Importa TODAS tus páginas ---
// (Corrigiendo las rutas para que sean relativas)
import Acceso from './pages/Acceso.jsx'; // Tu página (Paquete C)
import AuditoriaPage from './pages/AuditoriaPage.jsx';
import PersonasPage from './pages/PersonasPage.jsx';
import ReportesPage from './pages/ReportesPage.jsx';
import VehiculosPage from './pages/VehiculosPage.jsx';
import LoginPage from './pages/LoginPage.tsx';
import DashboardVigilantePage from './pages/DashboardVigilantePage.tsx';
import DashboardAdminPage from './pages/DashboardAdminPage.tsx';
import GestionPage from './pages/GestionPage.jsx';
import AlertasPage from './pages/AlertasPage.jsx';

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

        {/* 👇 Esta es la ruta que te interesa 👇 */}
        <Route path="/accesos" element={<Acceso />} />
        <Route path="/auditoria" element={<AuditoriaPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
        <Route path="/personas" element={<PersonasPage />} />
        <Route path="/vehiculos" element={<VehiculosPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard_vigilante" element={<DashboardVigilantePage />} />
        <Route path="/dashboard_admin" element={<DashboardAdminPage />} />
        <Route path="/gestion" element={<GestionPage />} />
        <Route path="/alertas" element={<AlertasPage />} />

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