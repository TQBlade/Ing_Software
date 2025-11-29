import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../pages/DashboardVigilantePage.module.css'; // Usamos los mismos estilos base

const API_URL = 'http://127.0.0.1:5000/api';

interface IResumen {
  total_vehiculos: number;
  total_accesos: number;
  total_alertas: number;
}
interface IAcceso {
  placa: string;
  tipo: string;
  color: string;
  propietario: string;
  resultado: string;
}

const DashboardAdminPage: React.FC = () => {
  const [resumen, setResumen] = useState<IResumen>({ total_vehiculos: 0, total_accesos: 0, total_alertas: 0 });
  const [accesos, setAccesos] = useState<IAcceso[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res1 = await axios.get(`${API_URL}/admin/resumen`, config);
      setResumen(res1.data);
      const res2 = await axios.get(`${API_URL}/admin/accesos`, config);
      setAccesos(res2.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  if (loading) return <div className="p-5">Cargando dashboard...</div>;

  return (
    <div className={styles.mainContent}> 
        {/* TARJETAS SUPERIORES */}
        <section className={`${styles.tarjeta} col-span-2 p-4 mb-4 text-center`}>
          <h2 className="text-xl font-bold mb-4 text-gray-700">Resumen Operativo</h2>
          <div className="d-flex justify-content-around">
             <div>
                <h3 className="display-4 fw-bold text-primary">{resumen.total_vehiculos}</h3>
                <span className="text-muted">Vehículos</span>
             </div>
             <div>
                <h3 className="display-4 fw-bold text-success">{resumen.total_accesos}</h3>
                <span className="text-muted">Accesos Totales</span>
             </div>
             <div>
                <h3 className="display-4 fw-bold text-danger">{resumen.total_alertas}</h3>
                <span className="text-muted">Alertas Activas</span>
             </div>
          </div>
        </section>

        {/* TABLA DE ACCESOS RECIENTES */}
        <section className={`${styles.tarjeta} col-span-2 p-4`}>
          <h2 className="text-xl font-bold mb-4 text-gray-700">Últimos Accesos Registrados</h2>
          <div className="overflow-x-auto">
            <table className="table table-striped table-sm">
              <thead className="table-light">
                <tr>
                  <th>Placa</th>
                  <th>Tipo</th>
                  <th>Propietario</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {accesos.slice(0, 5).map((a, index) => (
                  <tr key={index}>
                    <td>{a.placa}</td>
                    <td>{a.tipo}</td>
                    <td>{a.propietario}</td>
                    <td>
                        <span className={`badge ${a.resultado.includes('Autorizado') || a.resultado.includes('Concedido') ? 'bg-success' : 'bg-danger'}`}>
                            {a.resultado}
                        </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link to="/admin/historial" className="btn btn-link float-end">Ver Historial Completo</Link>
        </section>
    </div>
  );
};

export default DashboardAdminPage;