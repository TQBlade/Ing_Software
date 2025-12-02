import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2'; // <--- IMPORTANTE

const API_URL = 'http://127.0.0.1:5000/api';

const DashboardVigilantePage: React.FC = () => {
  const [ocupacion, setOcupacion] = useState({
    motos: { ocupados: 0, total: 1000, disp: 1000 },
    carros: { ocupados: 0, total: 300, disp: 300 },
    global: { ocupados: 0, total: 1300, disp: 1300, pct: 0 }
  });
  const [ultimos, setUltimos] = useState<any[]>([]);
  const [placaBusqueda, setPlacaBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  const cargarDatos = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [resOcup, resAccess] = await Promise.all([
        axios.get(`${API_URL}/ocupacion`, config),
        axios.get(`${API_URL}/ultimos_accesos`, config)
      ]);

      setOcupacion(resOcup.data);
      setUltimos(resAccess.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 10000); 
    return () => clearInterval(interval);
  }, [cargarDatos]);

  const buscarPlaca = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!placaBusqueda) return;
    
    try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/buscar_placa/${placaBusqueda}`, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        
        // SWEETALERT: Éxito
        Swal.fire({
            title: '✅ Vehículo Encontrado',
            html: `
                <div class="text-left">
                    <p><strong>Placa:</strong> ${res.data.placa}</p>
                    <p><strong>Propietario:</strong> ${res.data.propietario}</p>
                    <p><strong>Tipo:</strong> ${res.data.tipo}</p>
                    <p><strong>Color:</strong> ${res.data.color}</p>
                </div>
            `,
            icon: 'success',
            confirmButtonColor: '#b91c1c'
        });
        setPlacaBusqueda('');
    } catch { 
        // SWEETALERT: Error
        Swal.fire({
            title: '❌ No Registrado',
            text: `El vehículo ${placaBusqueda} no existe en el sistema.`,
            icon: 'error',
            confirmButtonColor: '#b91c1c'
        });
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-red-700">Cargando Sistema...</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
        
        {/* HEADER OCUPACIÓN */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border-t-4 border-red-700">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <i className="fas fa-parking mr-3 text-red-600"></i> Disponibilidad Actual
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CARROS */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-700 flex items-center"><i className="fas fa-car mr-2"></i> CARROS</span>
                        <span className="text-2xl font-extrabold text-blue-700">{ocupacion.carros.disp} <small className="text-sm text-gray-400 font-normal">/ {ocupacion.carros.total}</small></span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${(ocupacion.carros.ocupados/ocupacion.carros.total)*100}%` }}></div>
                    </div>
                </div>

                {/* MOTOS */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-700 flex items-center"><i className="fas fa-motorcycle mr-2"></i> MOTOS</span>
                        <span className="text-2xl font-extrabold text-yellow-600">{ocupacion.motos.disp} <small className="text-sm text-gray-400 font-normal">/ {ocupacion.motos.total}</small></span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-yellow-500 h-3 rounded-full transition-all" style={{ width: `${(ocupacion.motos.ocupados/ocupacion.motos.total)*100}%` }}></div>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* ACCIONES */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-4">Consulta de Placa</h3>
                    <form onSubmit={buscarPlaca} className="flex gap-3">
                        <input 
                            type="text" 
                            className="flex-1 border-2 border-gray-300 focus:border-red-500 rounded-lg px-4 py-3 text-lg font-bold uppercase text-center outline-none"
                            placeholder="PLACA"
                            value={placaBusqueda}
                            onChange={e => setPlacaBusqueda(e.target.value.toUpperCase())}
                        />
                        <button type="submit" className="bg-red-700 text-white px-6 rounded-lg font-bold hover:bg-red-800 transition shadow-md">
                            VERIFICAR
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Link to="/vigilante/historial" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition text-center group border border-gray-100">
                        <i className="fas fa-camera fa-2x text-red-600 mb-2 group-hover:scale-110 transition"></i>
                        <h4 className="font-bold text-gray-800">Validar Acceso</h4>
                    </Link>
                    <Link to="/vigilante/reportes" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition text-center group border border-gray-100">
                        <i className="fas fa-exclamation-triangle fa-2x text-orange-500 mb-2 group-hover:scale-110 transition"></i>
                        <h4 className="font-bold text-gray-800">Reportar Novedad</h4>
                    </Link>
                </div>
            </div>

            {/* TRÁFICO RECIENTE */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-full">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 text-sm uppercase">Tráfico Reciente</h3>
                    <span className="text-xs font-bold text-green-600 animate-pulse">● EN VIVO</span>
                </div>
                <div className="overflow-y-auto max-h-[300px]">
                    <table className="w-full text-left text-sm">
                        <tbody className="divide-y divide-gray-100">
                            {ultimos.map((u, i) => (
                                <tr key={i} className="hover:bg-red-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800 text-base">{u.placa}</div>
                                        <div className="text-xs text-gray-400">{u.fecha_hora}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${
                                            u.resultado.toLowerCase().includes('autorizado') || u.resultado.toLowerCase().includes('concedido')
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                            {u.resultado.split(' ')[0]}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {ultimos.length === 0 && <tr><td colSpan={2} className="text-center py-10 text-gray-400">Sin movimientos.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};

export default DashboardVigilantePage;