import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomTable from '../components/CustomTable.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx'; // <--- IMPORTANTE

const API_URL = 'http://127.0.0.1:5000/api';

const VehiculosDentro = () => {
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false); // <--- ESTADO DE CARGA
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);
  const [formReporte, setFormReporte] = useState({ tipo: 'Mal Parqueado', detalle: '', severidad: 'media' });

  const fetchVehiculos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/vigilante/vehiculos-en-patio`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehiculos(response.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVehiculos(); }, []);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setIsSending(true); // <--- ON
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/vigilante/reportar`, { ...formReporte, id_acceso: selectedVehiculo.id_acceso }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("✅ Incidente reportado.");
      setShowModal(false);
    } catch (err) { alert("Error al enviar."); }
    finally { setIsSending(false); } // <--- OFF
  };

  const filtered = vehiculos.filter(v => v.placa.toLowerCase().includes(searchTerm.toLowerCase()));

  const columns = useMemo(() => [
    { Header: 'Placa', accessor: 'placa', Cell: ({value}) => <span className="fw-bold">{value}</span> },
    { Header: 'Tipo', accessor: 'tipo' },
    { Header: 'Color', accessor: 'color' },
    { Header: 'Hora Entrada', accessor: 'hora_entrada', Cell: ({value}) => new Date(value).toLocaleTimeString() },
    { Header: 'Acción', accessor: 'id_acceso', Cell: ({row}) => <button className="btn btn-sm btn-outline-danger fw-bold" onClick={() => { setSelectedVehiculo(row); setShowModal(true); }}>Reportar</button> }
  ], []);

  return (
    <div className="container-fluid p-4">
      <LoadingOverlay isLoading={isSending} message="Enviando reporte..." />

      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
        <h1 className="h3 text-dark fw-bold">Vehículos en Patio</h1>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/vigilante/inicio')}>Volver</button>
      </div>

      <input type="text" className="form-control mb-4" placeholder="Buscar placa..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />

      {loading ? <p>Cargando...</p> : (
        <div className="card shadow-sm border-0"><div className="card-body p-0"><CustomTable columns={columns} data={filtered} /></div></div>
      )}

      {showModal && selectedVehiculo && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">Reportar {selectedVehiculo.placa}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                    </div>
                    <form onSubmit={handleSubmitReport}>
                        <div className="modal-body">
                            <label className="fw-bold">Tipo Incidente</label>
                            <select className="form-select mb-3" value={formReporte.tipo} onChange={e => setFormReporte({...formReporte, tipo: e.target.value})}>
                                <option>Mal Parqueado</option><option>Pico y Placa</option><option>Luces Encendidas</option><option>Otro</option>
                            </select>
                            <label className="fw-bold">Detalle</label>
                            <textarea className="form-control" rows="3" required value={formReporte.detalle} onChange={e => setFormReporte({...formReporte, detalle: e.target.value})}></textarea>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button type="submit" className="btn btn-danger">Enviar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
export default VehiculosDentro;