import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// (Importar el AuthContext real de Paquete A)
// import { useAuth } from '../context/AuthContext'; 

// Simulación del hook useAuth
const useAuth = () => ({
  logout: () => {
    localStorage.clear();
    console.log("Logged out");
  },
  token: localStorage.getItem("jwt_token") 
});

// Componente Navbar (Debería ser un componente separado)
const AdminNavbar = ({ onLogout }) => (
  <nav className="flex justify-between items-center bg-white text-red-700 p-4 shadow-md">
    <div className="flex items-center gap-3">
      <img src="/img/SmartCar.png" alt="SmartCar Logo" className="h-10" />
    </div>
    <div className="flex items-center gap-4">
      <a href="/dashboard_admin" className="font-semibold bg-red-50 p-2 rounded-md">🏠 Inicio</a>
      <span className="font-medium">👤 Administrador</span>
      <button onClick={onLogout} className="bg-white text-red-700 border border-red-700 px-3 py-1 rounded-md font-semibold hover:bg-red-700 hover:text-white transition-colors">
        Cerrar sesión
      </button>
    </div>
  </nav>
);

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const auth = useAuth();
  
  const [resumen, setResumen] = useState({ total_vehiculos: 0, total_accesos: 0, total_alertas: 0 });
  const [accesos, setAccesos] = useState([]);
  const [vigilanteForm, setVigilanteForm] = useState({ nombre: '', doc: '', telefono: '', rol: '1' });

  // 1. Verificar token y cargar datos
  useEffect(() => {
    if (!auth.token) {
      navigate("/");
      return;
    }

    const cargarDatos = async () => {
      // Cargar resumen
      const resResumen = await fetch("/api/admin/resumen");
      setResumen(await resResumen.json());
      
      // Cargar tabla
      const resAccesos = await fetch("/api/admin/accesos");
      setAccesos(await resAccesos.json());
    };
    
    cargarDatos();
  }, [auth.token, navigate]);

  // 2. Manejador de Logout
  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };
  
  // 3. Manejadores de exportación
  const handleExportPDF = () => window.open("/api/admin/exportar/pdf");
  const handleExportExcel = () => window.open("/api/admin/exportar/excel");

  // 4. Manejador de formulario
  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setVigilanteForm(prev => ({ ...prev, [id]: value }));
  };

  const handleRegistrar = async () => {
    const res = await fetch("/api/admin/registrar_vigilante", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: vigilanteForm.nombre,
        doc_identidad: vigilanteForm.doc,
        telefono: vigilanteForm.telefono,
        id_rol: vigilanteForm.rol
      })
    });
    const r = await res.json();
    if (r.status === "ok") alert("✅ Vigilante registrado correctamente");
    else alert("❌ Error al registrar");
    // Limpiar formulario
    setVigilanteForm({ nombre: '', doc: '', telefono: '', rol: '1' });
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <AdminNavbar onLogout={handleLogout} />

      <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
        
        {/* Tarjeta 1: Resumen General */}
        <div className="tarjeta bg-white rounded-lg shadow p-6 space-y-3">
          <h2 className="text-xl font-bold text-red-800">Resumen General</h2>
          <p className="text-lg">Total Vehículos: <span className="font-bold text-gray-700">{resumen.total_vehiculos}</span></p>
          <p className="text-lg">Total Accesos: <span className="font-bold text-gray-700">{resumen.total_accesos}</span></p>
          <p className="text-lg">Total Alertas: <span className="font-bold text-gray-700">{resumen.total_alertas}</span></p>
        </div>

        {/* Tarjeta 2: Registrar Vigilante */}
        <div className="tarjeta bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-bold text-red-800">Registrar Vigilante</h2>
          <input id="nombre" value={vigilanteForm.nombre} onChange={handleFormChange} className="w-full p-2 border rounded" placeholder="Nombre completo" />
          <input id="doc" value={vigilanteForm.doc} onChange={handleFormChange} className="w-full p-2 border rounded" placeholder="Documento" />
          <input id="telefono" value={vigilanteForm.telefono} onChange={handleFormChange} className="w-full p-2 border rounded" placeholder="Teléfono" />
          <select id="rol" value={vigilanteForm.rol} onChange={handleFormChange} className="w-full p-2 border rounded bg-white">
            <option value="1">Principal</option>
            <option value="2">Nocturno</option>
          </select>
          <button onClick={handleRegistrar} className="w-full bg-red-700 text-white p-2 rounded font-semibold hover:bg-red-800">Registrar</button>
        </div>

        {/* Tarjeta 3: Historial (ocupa 2 columnas) */}
        <div className="tarjeta bg-white rounded-lg shadow p-6 md:col-span-2">
          <h2 className="text-xl font-bold text-red-800 mb-4">Historial de Accesos</h2>
          <div className="flex gap-4 mb-4">
            <button onClick={handleExportPDF} className="bg-red-700 text-white px-4 py-2 rounded font-semibold hover:bg-red-800">📄 Exportar PDF</button>
            <button onClick={handleExportExcel} className="bg-green-700 text-white px-4 py-2 rounded font-semibold hover:bg-green-800">📊 Exportar Excel</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">Placa</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Color</th>
                  <th className="p-3">Propietario</th>
                  <th className="p-3">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {accesos.map((a, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{a.placa}</td>
                    <td className="p-3">{a.tipo}</td>
                    <td className="p-3">{a.color}</td>
                    <td className="p-3">{a.propietario}</td>
                    <td className={`p-3 font-semibold ${a.resultado === 'Autorizado' ? 'text-green-600' : 'text-red-600'}`}>{a.resultado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}