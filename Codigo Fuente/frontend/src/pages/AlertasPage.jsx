import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import CustomTable from '../components/CustomTable.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx'; // <--- IMPORTANTE

const API_URL = 'http://127.0.0.1:5000/api';

const AlertasPage = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // <--- ESTADO DE CARGA

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlertas(); }, []);

  const handleOpenResolve = (alerta) => {
    setSelectedAlerta(alerta);
    setAccionResolucion('Advertencia Verbal');
    setShowModal(true);
  };

  const confirmResolve = async () => {
    if (!selectedAlerta) return;
    setIsProcessing(true); // <--- ON
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/alertas/${selectedAlerta.id_alerta}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { accion_resolucion: accionResolucion }
      });
      
      alert(`✅ Alerta resuelta: ${accionResolucion}`);
      setShowModal(false);
      fetchAlertas();
    } catch (err) {
      alert("Error al resolver la alerta.");
    } finally {
        setIsProcessing(false); // <--- OFF
    }
  };

  const columns = useMemo(() => [
    { Header: 'Fecha', accessor: 'fecha_hora' },
    { Header: 'Vehículo', accessor: 'placa', Cell: ({row}) => <b>{row.placa} <small className="text-muted fw-normal">({row.tipo_vehiculo})</small></b> },
    { Header: 'Incidente', accessor: 'tipo' },
    { Header: 'Reportado Por', accessor: 'nombre_vigilante' },
    { Header: 'Severidad', accessor: 'severidad', Cell: ({value}) => <span className={`badge ${value==='alta'?'bg-danger':'bg-warning'}`}>{value}</span> },
    { Header: 'Acción', accessor: 'id_alerta', Cell: ({row}) => <button className="btn btn-outline-success btn-sm fw-bold" onClick={()=>handleOpenResolve(row)}>Resolver</button> }
  ], []);

  return (
    <div className="container-fluid p-4">
      <LoadingOverlay isLoading={isProcessing} message="Resolviendo incidente..." />

      <div className="d-flex justify-content-between align-items-center pb-2 mb-4 border-bottom">
        <h1 className="h2 text-gray-800 fw-bold">Centro de Alertas</h1>
      </div>

      {loading ? <div className="text-center p-5">Cargando alertas...</div> : (
        <div className="card shadow-sm border-0">
            <div className="card-body p-0">
                <CustomTable columns={columns} data={alertas} />
            </div>
            {alertas.length === 0 && <div className="p-5 text-center text-muted"><h4>Todo tranquilo</h4><p>No hay alertas activas.</p></div>}
        </div>
      )}

      {showModal && selectedAlerta && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header bg-success text-white">
                        <h5 className="modal-title">Resolver Alerta</h5>
                    </div>
                    <div className="modal-body">
                        <p><strong>Incidente:</strong> {selectedAlerta.tipo}</p>
                        <label className="form-label fw-bold">Acción Tomada:</label>
                        <select className="form-select" value={accionResolucion} onChange={(e) => setAccionResolucion(e.target.value)}>
                            <option>Advertencia Verbal</option>
                            <option>Multa / Sanción</option>
                            <option>Reporte a Autoridades</option>
                            <option>Falsa Alarma</option>
                        </select>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                        <button className="btn btn-success fw-bold" onClick={confirmResolve}>Confirmar</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
export default AlertasPage;