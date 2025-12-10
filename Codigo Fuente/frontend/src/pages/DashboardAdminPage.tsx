import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// URL dinámica para producción
const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000') + '/api';

const DashboardAdminPage: React.FC = () => {
  // 1. ESTADOS INICIALIZADOS CON VALORES POR DEFECTO (Para que no se vea vacío)
  const [resumen, setResumen] = useState({ 
    total_vehiculos: 0, 
    total_accesos: 0, 
    total_alertas: 0 
  });

  const [ocupacion, setOcupacion] = useState({ 
    global: { pct: 0, ocupados: 0, total: 1300 }, // 1300 Cupos totales
    motos: { disp: 1000, total: 1000 },           // 1000 Motos
    carros: { disp: 300, total: 300 }             // 300 Carros
  });

  const [accesos, setAccesos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. FUNCIÓN DE CARGA DE DATOS
  const cargarDatos = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [resResumen, resAcceso, resOcupacion] = await Promise.all([
        axios.get(`${API_URL}/admin/resumen`, config),
        axios.get(`${API_URL}/admin/accesos`, config),
        axios.get(`${API_URL}/ocupacion`, config) // Sin /api extra
      ]);

      setResumen(resResumen.data);
      setAccesos(resAcceso.data.slice(0, 5)); // Solo los últimos 5
      
      // Validamos que la ocupación traiga datos antes de setear
      if (resOcupacion.data && resOcupacion.data.global) {
          setOcupacion(resOcupacion.data);
      }

    } catch (err) {
      console.error("❌ Error cargando dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. EFECTO DE CARGA (Ciclo de 15 segundos)
  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 15000);
    return () => clearInterval(interval);
  }, [cargarDatos]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-semibold animate-pulse">Cargando Panel Administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-6 bg-gray-50 min-h-screen font-sans">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
                <p className="text-gray-500 text-sm">Resumen operativo y estado del sistema.</p>
            </div>
            <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-500 shadow-sm border mt-2 md:mt-0">
                📅 {new Date().toLocaleDateString()}
            </span>
        </div>

        {/* FILA 1: OCUPACIÓN Y ALERTAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* TARJETA 1: OCUPACIÓN (Ancha) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="font-bold text-gray-700">Ocupación del Parqueadero</h3>
                        <p className="text-xs text-gray-400">Capacidad en tiempo real</p>
                    </div>
                    <Link to="/admin/vehiculos" className="text-sm font-bold text-blue-600 hover:underline">
                        Gestionar Vehículos →
                    </Link>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs">
                            {ocupacion.global.ocupados} OCUPADOS
                        </span>
                        <span className={`font-bold text-xs ${ocupacion.global.pct > 90 ? 'text-red-600' : 'text-blue-600'}`}>
                            {ocupacion.global.pct}% Lleno
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                            className={`h-3 rounded-full transition-all duration-1000 ${ocupacion.global.pct > 90 ? 'bg-red-600' : ocupacion.global.pct > 60 ? 'bg-yellow-400' : 'bg-green-500'}`} 
                            style={{ width: `${ocupacion.global.pct}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>0</span>
                        <span>Capacidad Total: {ocupacion.global.total}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-[10px] uppercase font-bold text-blue-400">Carros Disp.</p>
                        <p className="text-lg font-bold text-blue-700">{ocupacion.carros.disp}</p>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                        <p className="text-[10px] uppercase font-bold text-yellow-500">Motos Disp.</p>
                        <p className="text-lg font-bold text-yellow-700">{ocupacion.motos.disp}</p>
                    </div>
                </div>
            </div>

            {/* TARJETA 2: ALERTAS (Roja) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <i className="fas fa-bell fa-5x text-red-500"></i>
                </div>
                <div>
                    <h3 className="font-bold text-red-800 mb-1">Alertas Activas</h3>
                    <span className="text-5xl font-extrabold text-red-600">{resumen.total_alertas}</span>
                    <p className="text-xs text-red-400 mt-1">Incidentes sin resolver</p>
                </div>
                <Link to="/admin/alertas" className="mt-4 w-full py-2 bg-red-600 text-white text-center rounded-lg font-bold hover:bg-red-700 transition text-sm">
                    Ver Centro de Alertas
                </Link>
            </div>
        </div>

        {/* FILA 2: KPIs Y TABLA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMNA IZQUIERDA: TARJETAS PEQUEÑAS */}
            <div className="space-y-6">
                
                {/* TARJETA VEHÍCULOS */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs uppercase font-bold">Vehículos Registrados</p>
                        <p className="text-3xl font-bold text-gray-800">{resumen.total_vehiculos}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full text-blue-500">
                        <i className="fas fa-car fa-lg"></i>
                    </div>
                </div>

                {/* TARJETA ACCESOS (LA QUE FALTABA) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs uppercase font-bold">Accesos Totales</p>
                        <p className="text-3xl font-bold text-gray-800">{resumen.total_accesos}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full text-green-500">
                        <i className="fas fa-history fa-lg"></i>
                    </div>
                </div>

            </div>

            {/* COLUMNA DERECHA: TABLA ÚLTIMOS ACCESOS */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-white border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 text-sm uppercase">Últimos Accesos</h3>
                    <Link to="/admin/historial" className="text-xs font-bold text-blue-600 hover:underline">VER TODOS</Link>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3 font-medium">Placa</th>
                                <th className="px-6 py-3 font-medium">Propietario</th>
                                <th className="px-6 py-3 font-medium">Tipo</th>
                                <th className="px-6 py-3 font-medium">Hora</th>
                                <th className="px-6 py-3 font-medium text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {accesos.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">No hay registros recientes</td></tr>
                            ) : (
                                accesos.map((acc: any, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3 font-bold text-gray-800">{acc.placa}</td>
                                        <td className="px-6 py-3 text-gray-600">{acc.propietario}</td>
                                        <td className="px-6 py-3 text-gray-500 text-xs uppercase">{acc.tipo}</td>
                                        <td className="px-6 py-3 text-gray-500 font-mono text-xs">{acc.fecha ? acc.fecha.split(' ')[1] + ' ' + acc.fecha.split(' ')[2] : '--'}</td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                                acc.resultado.toLowerCase().includes('autorizado') || acc.resultado.toLowerCase().includes('concedido')
                                                ? 'bg-green-50 text-green-700 border-green-200' 
                                                : 'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                                {acc.resultado.includes('Autorizado') ? 'Permitido' : 'Denegado'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};

export default DashboardAdminPage;