import { Route, Routes } from 'react-router-dom';

// --- 1. Importa tu página (con el nombre corregido) ---
import Acceso from './pages/Acceso.jsx';

// import Dashboard from './pages/Dashboard.jsx'

function App() {
  return (
    <div>
      <Routes>
        {/* --- 2. Define tus rutas --- */}
        
        {/* <Route path="/" element={<Dashboard />} /> */}

        {/* 👇 Esta es la ruta que te interesa 👇 */}
        <Route path="/accesos" element={<Acceso />} />

        {/* Ruta por si no encuentra nada */}
        <Route path="*" element={<h1>404: Página No Encontrada</h1>} />
      </Routes>
    </div>
  )
}

export default App