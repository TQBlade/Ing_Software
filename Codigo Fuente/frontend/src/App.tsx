import { Navigate, Route, Routes } from 'react-router-dom'

// Layouts
import AdminLayout from './layouts/AdminLayout.tsx'
import VigilanteLayout from './layouts/VigilanteLayout.tsx'

// Páginas Generales
import AccesoPage from './pages/Acceso.jsx'
import LoginPage from './pages/LoginPage.tsx'
import PersonasPage from './pages/PersonasPage.jsx'
import VehiculosPage from './pages/VehiculosPage.jsx'

// Páginas Admin
import AlertasPage from './pages/AlertasPage.jsx'
import AuditoriaPage from './pages/AuditoriaPage.jsx'
import CalendarioAdmin from './pages/CalendarioAdmin.jsx'
import DashboardAdminPage from './pages/DashboardAdminPage.tsx'
import GestionPage from './pages/GestionPage.jsx'
import ReportesPage from './pages/ReportesPage.jsx'
import VigilantesPage from './pages/VigilantesPage.jsx'; // <--- 1. IMPORTAR AQUÍ

// Páginas Vigilante
import CalendarioVigilante from './pages/CalendarioVigilante.jsx'
import DashboardVigilantePage from './pages/DashboardVigilantePage.tsx'
import GestionVigilante from './pages/GestionVigilante.jsx'
import ReportesVigilante from './pages/ReportesVigilante.jsx'
import VehiculosDentro from './pages/VehiculosDentro.jsx'

export default function App() {
  return (
    <Routes>

      {/* LOGIN */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* ====================== ADMIN ====================== */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="inicio" element={<DashboardAdminPage />} />
        <Route path="historial" element={<AccesoPage />} />
        
        {/* Gestión y Módulos */}
        <Route path="gestion_a" element={<GestionPage />} />
        
        {/* CRUDs */}
        <Route path="personas" element={<PersonasPage />} />
        <Route path="vehiculos" element={<VehiculosPage />} />
        <Route path="vigilantes" element={<VigilantesPage />} /> {/* <--- 2. RUTA AGREGADA */}
        
        {/* Herramientas */}
        <Route path="reportes" element={<ReportesPage />} />
        <Route path="auditoria" element={<AuditoriaPage />} />
        <Route path="alertas" element={<AlertasPage />} />  
        <Route path="calendario" element={<CalendarioAdmin />} />

        {/* Ruta legacy */}
        <Route path="gestion" element={<PersonasPage />} />

        {/* Default admin */}
        <Route index element={<Navigate to="inicio" replace />} />
      </Route>

      {/* ==================== VIGILANTE ==================== */}
      <Route path="/vigilante" element={<VigilanteLayout />}>
        <Route path="inicio" element={<DashboardVigilantePage />} />
        <Route path="historial" element={<AccesoPage />} />
        <Route path="gestion" element={<GestionVigilante />} />
        
        <Route path="vehiculos" element={<VehiculosPage />} />
        <Route path="personas" element={<PersonasPage />} />
        <Route path="calendario" element={<CalendarioVigilante />} />
        <Route path="vehiculos_dentro" element={<VehiculosDentro />} />
        <Route path="reportes" element={<ReportesVigilante />} />

        {/* Default vigilante */}
        <Route index element={<Navigate to="inicio" replace />} />
      </Route>

      {/* ====================== 404 ======================= */}
      <Route
        path="*"
        element={
          <div className="flex h-screen w-screen flex-col items-center justify-center">
            <h1 className="text-4xl font-bold text-red-700">404</h1>
            <p className="text-gray-600">Página No Encontrada</p>
          </div>
        }
      />
    </Routes>
  )
}