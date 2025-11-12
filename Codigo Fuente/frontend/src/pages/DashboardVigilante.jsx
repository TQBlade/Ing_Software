import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// (Importar el AuthContext real de Paquete A)
// import { useAuth } from '../context/AuthContext';

// Simulación del hook useAuth
const useAuth = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user_info") || "null"));
  const logout = () => {
    localStorage.clear();
    console.log("Logged out");
  };
  return { user, token: localStorage.getItem("jwt_token"), logout };
};

// Componente Navbar (Debería ser un componente separado)
const VigilanteNavbar = ({ userName, onLogout }) => (
  <nav className="flex justify-between items-center bg-white text-red-700 p-4 shadow-md">
    <div className="flex items-center gap-3">
      <img src="/img/SmartCar.png" alt="SmartCar Logo" className="h-10" />
    </div>
    <div className="flex items-center gap-4 text-sm font-medium">
      <Link to="/dashboard_vigilante" className="bg-red-50 p-2 rounded-md">🏠 Inicio</Link>
      <Link to="/historial" className="hover:text-red-900">📝 Historial</Link>
      <Link to="/alertas" className="hover:text-red-900">🚨 Alertas</Link>
      <Link to="/gestion" className="hover:text-red-900">⚙️ Gestión</Link>
      <Link to="/calendario" className="hover:text-red-900">📅 Calendario</Link>
      <span className="font-medium text-gray-700">👤 {userName || 'Vigilante'}</span>
      <button onClick={onLogout} className="bg-white text-red-700 border border-red-700 px-3 py-1 rounded-md font-semibold hover:bg-red-700 hover:text-white transition-colors">
        Cerrar sesión
      </button>
    </div>
  </nav>
);

export default function DashboardVigilante() {
  const navigate = useNavigate();
  const auth = useAuth();
  
  const [ultimosAccesos, setUltimosAccesos] = useState([]);
  const [totalVehiculos, setTotalVehiculos] = useState(0);
  const [alertasActivas, setAlertasActivas] = useState("0 alertas");
  const [placaBusqueda, setPlacaBusqueda] = useState('');

  // 1. Verificar token y cargar datos
  useEffect(() => {
    if (!auth.token) {
      navigate("/");
      return;
    }

    const cargarDatos = async () => {
      // Cargar accesos
      const resAccesos = await fetch("/api/ultimos_accesos");
      setUltimosAccesos(await resAccesos.json());
      
      // Cargar total vehículos
      const resVehiculos = await fetch("/api/total_vehiculos");
      const dataVehiculos = await resVehiculos.json();
      setTotalVehiculos(dataVehiculos.total);

      // Cargar alertas
      const resAlertas = await fetch("/api/alertas_activas");
      const dataAlertas = await resAlertas.json();
      setAlertasActivas(`${dataAlertas.total} alertas activas`);
    };
    
    cargarDatos();
  }, [auth.token, navigate]);

  // 2. Manejador de Logout
  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  // 3. Manejador de Búsqueda de Placa
  const handleBuscarPlaca = async () => {
    if (!placaBusqueda) {
      alert("Por favor ingresa una placa.");
      return;
    }
    try {
      const res = await fetch(`/api/buscar_placa/${placaBusqueda}`);
      const data = await res.json();

      if (!res.ok) {
        alert("❌ Placa no encontrada");
        return;
      }
      
      alert(`✅ Vehículo encontrado:\nPlaca: ${data.placa}\nTipo: ${data.tipo}\nColor: ${data.color}\nPropietario: ${data.propietario}`);
    } catch (err) {
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <VigilanteNavbar userName={auth.user?.nombre} onLogout={handleLogout} />

      <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
        
        {/* Tarjeta 1: Validar Acceso (Tu Paquete C) */}
        <div className="tarjeta bg-red-100 border border-red-300 rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-bold text-red-800">Validar acceso vehicular</h2>
          <input 
            type="text" 
            className="w-full p-2 border rounded" 
            placeholder="Buscar placa..." 
            value={placaBusqueda}
            onChange={(e) => setPlacaBusqueda(e.target.value)}
          />
          <button onClick={handleBuscarPlaca} className="w-full bg-red-700 text-white p-2 rounded font-semibold hover:bg-red-800">Verificar</button>
        </div>
        
        {/* Tarjeta 2: Alertas Activas (Tu Paquete C) */}
        <div className="tarjeta bg-yellow-100 border border-yellow-300 rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-bold text-yellow-800">Alertas Activas</h2>
          <p className="text-2xl font-bold text-gray-700">{alertasActivas}</p>
          <button onClick={() => navigate('/alertas')} className="w-full bg-yellow-600 text-white p-2 rounded font-semibold hover:bg-yellow-700">Gestionar alertas</button>
        </div>

        {/* Tarjeta 3: Historial (Paquete B) */}
        <div className="tarjeta bg-white rounded-lg shadow p-6 md:col-span-2">
          <h2 className="text-xl font-bold text-red-800 mb-4">Últimos Accesos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">Fecha y Hora</th>
                  <th className="p-3">Placa</th>
                  <th className="p-3">Resultado</th>
                  <th className="p-3">Vigilante</th>
                </tr>
              </thead>
              <tbody>
                {ultimosAccesos.length > 0 ? ultimosAccesos.map((a, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3">{a.fecha_hora}</td>
                    <td className="p-3 font-medium">{a.placa}</td>
                    <td className={`p-3 font-semibold ${a.resultado === 'Autorizado' ? 'text-green-600' : 'text-red-600'}`}>{a.resultado}</td>
                    <td className="p-3">{a.vigilante}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="p-4 text-center text-gray-500">No hay registros</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tarjeta 4: Gestión (Paquete B) */}
        <div className="tarjeta bg-white rounded-lg shadow p-6 space-y-4 md:col-span-2">
          <h2 className="text-xl font-bold text-red-800">Gestión de Vehículos</h2>
          <p className="text-lg">Total registrados: <span className="font-bold text-gray-700">{totalVehiculos}</span></p>
          <button onClick={() => navigate('/gestion')} className="bg-gray-700 text-white p-2 rounded font-semibold hover:bg-gray-800">Ver Vehículos</button>
        </div>

      </main>
    </div>
  );
}