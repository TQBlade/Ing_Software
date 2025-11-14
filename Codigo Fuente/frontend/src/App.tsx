import { Route, Routes } from 'react-router-dom';

// --- 1. Importa tu página (con el nombre corregido) ---
import Acceso from './pages/Acceso.jsx';
import AuditoriaPage from './pages/AuditoriaPage.jsx';
import ReportesPage from './pages/ReportesPage.jsx';
import PersonasPage from './pages/PersonasPage.jsx';
import VehiculosPage from './pages/VehiculosPage.jsx';
import LoginPage from './pages/LoginPage.tsx';
import DashboardVigilantePage from './pages/DashboardVigilantePage.tsx';
import DashboardAdminPage from './pages/DashboardAdminPage.tsx';

// import Dashboard from './pages/Dashboard.jsx'

function App() {
  return (
    <div>
      <Routes>
        {/* --- 2. Define tus rutas --- */}
        
        {/* <Route path="/" element={<Dashboard />} /> */}

        {/* 👇 Esta es la ruta que te interesa 👇 */}
        <Route path="/accesos" element={<Acceso />} />
        <Route path="/auditoria" element={<AuditoriaPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
        <Route path="/personas" element={<PersonasPage />} />
        <Route path="/vehiculos" element={<VehiculosPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard_vigilante" element={<DashboardVigilantePage />} />
        <Route path="/dashboard_admin" element={<DashboardAdminPage />} />

        {/* Ruta por si no encuentra nada */}
        <Route path="*" element={<h1>404: Página No Encontrada</h1>} />
      </Routes>
    </div>
  )
}

export default App