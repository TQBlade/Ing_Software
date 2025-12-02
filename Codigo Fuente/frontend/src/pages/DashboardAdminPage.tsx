import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Configuración API
const API_URL = 'http://127.0.0.1:5000/api';

// Interfaces de datos
interface IResumen {
  total_vehiculos: number;
  total_accesos: number;
  total_alertas: number;
}
interface IOcupacion {
  capacidad_total: number;
  ocupados_total: number;
  disponibles: number;
  porcentaje: number;
}
interface IAcceso {
  fecha: string;
  placa: string;
  tipo: string;
  propietario: string;
  resultado: string;
}

const DashboardAdminPage: React.FC = () => {
  // Estados
  const [resumen, setResumen] = useState<IResumen>({ total_vehiculos: 0, total_accesos: 0, total_alertas: 0 });
  const [ocupacion, setOcupacion] = useState<IOcupacion>({ capacidad_total: 100, ocupados_total: 0, disponibles: 0, porcentaje: 0 });
  const [accesos, setAccesos] = useState<IAcceso[]>([]);
  const [loading, setLoading] = useState(true);

  // Carga de datos
  const cargarDatos = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Llamadas en paralelo para mayor velocidad
      const [resResumen, resAcceso, resOcupacion] = await Promise.all([
        axios.get(`${API_URL}/admin/resumen`, config),
        axios.get(`${API_URL}/admin/accesos`, config),
        axios.get(`${API_URL}/ocupacion`, config) // Asegúrate de haber agregado esta ruta en server.py
      ]);

      setResumen(resResumen.data);
      setAccesos(resAcceso.data.slice(0, 5)); // Solo los últimos 5
      setOcupacion(resOcupacion.data);

    } catch (err) {
      console.error("Error cargando dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
    // Refresco automático cada 30 segundos para mantener la ocupación real
    const interval = setInterval(cargarDatos, 30000);
    return () => clearInterval(interval);
  }, [cargarDatos]);

  // Loading Screen (Círculo dando vueltas)
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-semibold animate-pulse">Cargando Panel Administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-6 bg-gray-100 min-h-screen font-sans">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
                <p className="text-gray-500">Resumen operativo y estado del sistema.</p>
            </div>
            <div className="mt-4 md:mt-0">
                <span className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-semibold text-gray-600 border border-gray-200">
                    📅 {new Date().toLocaleDateString()}
                </span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* 1. TARJETA DE OCUPACIÓN (Columna Ancha) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-700">Ocupación del Parqueadero</h3>
                        <p className="text-sm text-gray-400">Capacidad en tiempo real</p>
                    </div>
                    <Link to="/admin/vehiculos" className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline transition">
                        Gestionar Vehículos →
                    </Link>
                </div>

                {/* Barra de Progreso */}
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                {ocupacion.ocupados_total} Ocupados
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-blue-600">
                                {ocupacion.porcentaje}% Lleno
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-gray-200">
                        <div 
                            style={{ width: `${ocupacion.porcentaje}%` }} 
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ease-out ${
                                ocupacion.porcentaje > 90 ? 'bg-red-500' : 
                                ocupacion.porcentaje > 60 ? 'bg-yellow-400' : 'bg-green-500'
                            }`}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>0</span>
                        <span>Capacidad Total: {ocupacion.capacidad_total}</span>
                    </div>
                </div>
            </div>

            {/* 2. TARJETA DE ALERTAS (Acción Rápida) */}
            <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-2xl shadow-sm border border-red-100 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-red-800">Alertas Activas</h3>
                        <i className="fas fa-bell text-red-500 text-xl animate-pulse"></i>
                    </div>
                    <div className="text-5xl font-extrabold text-red-600 my-2">{resumen.total_alertas}</div>
                    <p className="text-xs text-red-400">Incidentes sin resolver</p>
                </div>
                <Link to="/admin/alertas" className="mt-4 w-full py-2 bg-red-600 text-white text-center rounded-lg font-bold hover:bg-red-700 transition shadow-md">
                    Ver Centro de Alertas
                </Link>
            </div>
        </div>

        {/* 3. KPIS SECUNDARIOS Y ACCESOS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* KPI Pequeños */}
            <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs uppercase font-bold">Vehículos Registrados</p>
                        <p className="text-2xl font-bold text-gray-800">{resumen.total_vehiculos}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full text-blue-500"><i className="fas fa-car fa-lg"></i></div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs uppercase font-bold">Accesos Totales</p>
                        <p className="text-2xl font-bold text-gray-800">{resumen.total_accesos}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full text-green-500"><i className="fas fa-history fa-lg"></i></div>
                </div>
            </div>

            {/* TABLA DE ACCESOS RECIENTES */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-700 text-sm uppercase">Últimos Accesos</h3>
                    <Link to="/admin/historial" className="text-xs font-bold text-blue-500 hover:text-blue-700">VER TODOS</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-white border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">Placa</th>
                                <th className="px-6 py-3 font-medium">Propietario</th>
                                <th className="px-6 py-3 font-medium">Tipo</th>
                                <th className="px-6 py-3 font-medium">Hora</th>
                                <th className="px-6 py-3 font-medium text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {accesos.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">No hay registros recientes</td></tr>
                            ) : (
                                accesos.map((acc, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3 font-bold text-gray-800">{acc.placa}</td>
                                        <td className="px-6 py-3 text-gray-600">{acc.propietario}</td>
                                        <td className="px-6 py-3 text-gray-500">{acc.tipo}</td>
                                        <td className="px-6 py-3 text-gray-500 font-mono text-xs">{acc.fecha.split(' ')[1]}</td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
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