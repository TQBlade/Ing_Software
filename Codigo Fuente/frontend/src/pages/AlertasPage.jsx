import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import CustomTable from '../components/CustomTable.jsx';

const API_URL = 'http://127.0.0.1:5000/api';

const AlertasPage = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el Modal de Resolución
  const [showModal, setShowModal] = useState(false);
  const [selectedAlerta, setSelectedAlerta] = useState(null);
  const [accionResolucion, setAccionResolucion] = useState('Advertencia Verbal');

  const fetchAlertas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/alertas`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      setAlertas(response.data);
    } catch (err) {
      console.error("Error cargando alertas:", err);
      setError("No se pudieron cargar las alertas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertas();
  }, []);

  // Abrir modal
  const handleOpenResolve = (alerta) => {
    setSelectedAlerta(alerta);
    setAccionResolucion('Advertencia Verbal'); // Default
    setShowModal(true);
  };

  // Enviar resolución al backend
  const confirmResolve = async () => {
    if (!selectedAlerta) return;

    try {
      const token = localStorage.getItem('token');
      // Enviamos DELETE con body (axios permite data en config de delete)
      await axios.delete(`${API_URL}/admin/alertas/${selectedAlerta.id_alerta}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { accion_resolucion: accionResolucion } // Enviamos la acción elegida
      });
      
      alert(`✅ Alerta resuelta con acción: ${accionResolucion}`);
      setShowModal(false);
      fetchAlertas(); // Recargar tabla
    } catch (err) {
      alert("Error al resolver la alerta.");
      console.error(err);
    }
  };

  // --- Definición de Columnas ---
  const columns = useMemo(() => [
    { Header: 'Fecha/Hora', accessor: 'fecha_hora' },
    { 
        Header: 'Vehículo', 
        accessor: 'placa',
        Cell: ({ row }) => (
            <div>
                <div className="fw-bold text-dark">{row.placa}</div>
                <small className="text-muted">{row.tipo_vehiculo} - {row.color}</small>
            </div>
        )
    },
    { Header: 'Incidente', accessor: 'tipo' },
    { 
        Header: 'Reportado Por', 
        accessor: 'nombre_vigilante',
        Cell: ({ value }) => <span className="fst-italic text-secondary"><i className="fas fa-user-shield me-1"></i>{value}</span>
    },
    { 
        Header: 'Severidad', 
        accessor: 'severidad',
        Cell: ({ value }) => {
            let badgeClass = 'bg-secondary';
            const val = value ? value.toLowerCase() : '';
            if (val === 'alta' || val === 'critica') badgeClass = 'bg-danger';
            if (val === 'media') badgeClass = 'bg-warning text-dark';
            if (val === 'baja') badgeClass = 'bg-info text-dark';
            return <span className={`badge ${badgeClass}`}>{value ? value.toUpperCase() : 'N/A'}</span>;
        }
    },
    {
        Header: 'Gestión',
        accessor: 'actions',
        Cell: ({ row }) => (
            <button 
                className="btn btn-outline-success btn-sm fw-bold" 
                onClick={() => handleOpenResolve(row)}
                title="Gestionar y Resolver"
            >
                <i className="fas fa-check-circle me-1"></i> Resolver
            </button>
        )
    }
  ], []);

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center pb-2 mb-4 border-bottom">
        <h1 className="h2 text-gray-800">
            <i className="fas fa-exclamation-triangle text-warning me-2"></i>
            Centro de Alertas
        </h1>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      
      {loading ? (
        <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="card shadow-sm border-0">
            <div className="card-body p-0">
                <CustomTable columns={columns} data={alertas} />
            </div>
            {alertas.length === 0 && (
                <div className="p-5 text-center text-muted">
                    <h4>Sin novedades pendientes</h4>
                    <p>El sistema se encuentra libre de alertas activas.</p>
                </div>
            )}
        </div>
      )}

      {/* MODAL DE RESOLUCIÓN */}
      {showModal && selectedAlerta && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header bg-success text-white">
                        <h5 className="modal-title">Resolver Alerta - {selectedAlerta.placa}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                    </div>
                    <div className="modal-body">
                        <p><strong>Incidente:</strong> {selectedAlerta.tipo}</p>
                        <p className="text-muted small">{selectedAlerta.detalle}</p>
                        <hr/>
                        <label className="form-label fw-bold">Seleccione la acción tomada:</label>
                        <select 
                            className="form-select mb-3"
                            value={accionResolucion}
                            onChange={(e) => setAccionResolucion(e.target.value)}
                        >
                            <option value="Advertencia Verbal">🗣️ Advertencia Verbal</option>
                            <option value="Multa / Sanción">📝 Aplicar Multa / Sanción</option>
                            <option value="Reporte a Autoridades">👮 Reporte a Autoridades</option>
                            <option value="Falsa Alarma">❌ Falsa Alarma / Error</option>
                            <option value="Solucionado sin acción">✅ Solucionado sin acción</option>
                        </select>
                        <div className="alert alert-info small">
                            <i className="fas fa-info-circle me-1"></i>
                            Al resolver, la alerta se archivará y la acción quedará registrada en la auditoría.
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                        <button className="btn btn-success fw-bold" onClick={confirmResolve}>Confirmar Resolución</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AlertasPage;