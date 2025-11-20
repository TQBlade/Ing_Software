import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import CustomTable from '../components/CustomTable.jsx';

const API_URL = 'http://127.0.0.1:5000/api';

const AlertasPage = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlertas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/alertas`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      setAlertas(response.data);
    } catch (error) {
      console.error("Error cargando alertas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertas();
  }, []);

  const handleResolver = async (alerta) => {
    if (window.confirm("¿Marcar esta alerta como resuelta (eliminar)?")) {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/admin/alertas/${alerta.id_alerta}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAlertas(); // Recargar tabla
        } catch (error) {
            alert("Error al resolver alerta");
        }
    }
  };

  const columns = useMemo(() => [
    { Header: 'Fecha', accessor: 'fecha_hora' },
    { 
        Header: 'Tipo', 
        accessor: 'tipo',
        Cell: ({ value }) => <span className="fw-bold">{value}</span>
    },
    { Header: 'Detalle', accessor: 'detalle' },
    { 
        Header: 'Severidad', 
        accessor: 'severidad',
        Cell: ({ value }) => {
            let color = 'secondary';
            if (value === 'alta') color = 'danger';
            if (value === 'media') color = 'warning';
            if (value === 'baja') color = 'info';
            return <span className={`badge bg-${color}`}>{value ? value.toUpperCase() : 'N/A'}</span>;
        }
    },
    { Header: 'Vigilante', accessor: 'nombre_vigilante' },
    {
        Header: 'Acciones',
        accessor: 'actions',
        Cell: ({ row }) => (
            <button 
                className="btn btn-sm btn-success" 
                onClick={() => handleResolver(row)}
            >
                <i className="fas fa-check"></i> Resolver
            </button>
        )
    }
  ], []);

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center pb-2 mb-4 border-bottom">
        <h1 className="h2 text-gray-800">Gestión de Alertas</h1>
      </div>

      {loading ? (
        <div className="text-center">Cargando alertas...</div>
      ) : (
        <div className="card shadow-sm">
            <div className="card-body p-0">
                <CustomTable columns={columns} data={alertas} />
            </div>
        </div>
      )}
    </div>
  );
};

export default AlertasPage;