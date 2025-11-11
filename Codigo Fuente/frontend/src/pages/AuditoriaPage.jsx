import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Asegúrate de tener axios instalado (npm install axios)
import CustomTable from '../components/CustomTable.jsx'; // Importas tu tabla personalizada
// (Opcional) Importa algún componente de 'Loading'
// import LoadingSpinner from '../components/LoadingSpinner'; 

// --- Lógica de API (que iría en el servicio) ---

// Función helper para obtener el token (ajusta esto a tu app)
const getToken = () => {
    return localStorage.getItem('token'); // O desde donde lo gestiones
};

// Asumimos que tu API corre en localhost:5000
const API_URL = 'http://127.0.0.1:5000/api/admin/auditoria';

/**
 * Obtiene el historial completo de auditoría.
 */
const getHistorialAuditoria = async () => {
    const token = getToken();
    if (!token) {
        throw new Error('No se encontró token de autenticación');
    }

    try {
        const response = await axios.get(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener el historial de auditoría:', error.response?.data || error.message);
        throw error.response?.data || new Error('Error en el servidor');
    }
};

// --- Componente de la Página ---

const AuditoriaPage = () => {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect para cargar los datos cuando el componente se monta
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                // Usamos la función definida arriba
                const data = await getHistorialAuditoria(); 
                setHistorial(data);
                setError(null);
            } catch (err) {
                setError(err.message || 'No se pudo cargar el historial');
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, []); // El array vacío asegura que se ejecute solo una vez

    // Definir las columnas para el CustomTable
    const columns = React.useMemo(() => [
        {
            Header: 'Fecha y Hora',
            accessor: 'fecha_hora',
            Cell: ({ value }) => new Date(value).toLocaleString()
        },
        {
            Header: 'Vigilante',
            accessor: 'nombre_vigilante',
        },
        {
            Header: 'Entidad',
            accessor: 'entidad',
        },
        {
            Header: 'ID Entidad',
            accessor: 'id_entidad',
        },
        {
            Header: 'Acción',
            accessor: 'accion',
        },
        {
            Header: 'Datos Previos',
            accessor: 'datos_previos',
            Cell: ({ value }) => <pre style={{ margin: 0 }}>{JSON.stringify(value, null, 2)}</pre>
        },
        {
            Header: 'Datos Nuevos',
            accessor: 'datos_nuevos',
            Cell: ({ value }) => <pre style={{ margin: 0 }}>{JSON.stringify(value, null, 2)}</pre>
        },
    ], []);

    // Renderizado condicional
    if (loading) {
        return <div>Cargando historial de auditoría...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    return (
        <div className="container-fluid p-4">
            <h1 className="h3 mb-4 text-gray-800">Historial de Auditoría</h1>
            
            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Registros del Sistema</h6>
                </div>
                <div className="card-body">
                    <CustomTable
                        columns={columns}
                        data={historial}
                    />
                </div>
            </div>
        </div>
    );
};

export default AuditoriaPage;