import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://127.0.0.1:5000/api';

const ReportesVigilante = () => {
  const navigate = useNavigate();
  
  // Estados para Tiempo Real
  const [horaServer, setHoraServer] = useState('--:--');
  const [vehiculosDentro, setVehiculosDentro] = useState(0);
  
  // Estados para Formulario
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Estados para Historial
  const [historial, setHistorial] = useState([]);

  const getToken = () => localStorage.getItem('token');

  // 1. FUNCIÓN: Cargar datos tiempo real (Se repite cada 5 seg)
  const fetchRealTimeData = async () => {
    try {
      const response = await axios.get(`${API_URL}/vigilante/estado-patio`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setHoraServer(response.data.hora_actual);
      setVehiculosDentro(response.data.vehiculos_dentro);
    } catch (err) {
      console.error("Error sync:", err);
    }
  };

  // 2. FUNCIÓN: Cargar historial personal
  const fetchHistorial = async () => {
    try {
      const response = await axios.get(`${API_URL}/vigilante/mis-reportes`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setHistorial(response.data);
    } catch (err) {
      console.error("Error historial:", err);
    }
  };

  // 3. EFECTO: Iniciar ciclo de actualización
  useEffect(() => {
    fetchRealTimeData(); // Carga inicial
    fetchHistorial();    // Carga inicial

    const intervalo = setInterval(() => {
      fetchRealTimeData();
    }, 10000); // Actualiza cada 10 segundos

    return () => clearInterval(intervalo);
  }, []);

  // 4. MANEJO FORMULARIO
  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!asunto || !descripcion) return alert("Complete los campos");

    setIsSending(true);
    try {
      await axios.post(`${API_URL}/vigilante/novedad`, {
        asunto, descripcion
      }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      alert("✅ Novedad registrada correctamente");
      setAsunto('');
      setDescripcion('');
      fetchHistorial(); // Refrescar lista
    } catch (err) {
      alert("Error al registrar");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container-fluid p-4 bg-gray-50 min-vh-100">
      
      {/* HEADER CON RELOJ */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-4 rounded shadow-sm">
        <div>
          <h1 className="h3 fw-bold text-dark mb-0">Centro de Reportes</h1>
          <p className="text-muted mb-0">Gestión de incidencias y estado del patio</p>
        </div>
        <div className="text-end">
          <h2 className="display-6 fw-bold text-primary mb-0">{vehiculosDentro}</h2>
          <span className="badge bg-primary">Vehículos Adentro (Hoy)</span>
          <div className="mt-2 text-secondary small fw-bold">
            <i className="fas fa-clock me-1"></i> {horaServer}
          </div>
        </div>
      </div>

      <div className="row g-4">
        
        {/* COLUMNA IZQUIERDA: Formulario */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-danger text-white fw-bold">
              <i className="fas fa-bullhorn me-2"></i> Reportar Novedad General
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Asunto</label>
                  <select className="form-select" value={asunto} onChange={e=>setAsunto(e.target.value)} required>
                    <option value="">Seleccione...</option>
                    <option value="Falla Eléctrica">Falla Eléctrica</option>
                    <option value="Daño Infraestructura">Daño Infraestructura</option>
                    <option value="Portón Averiado">Portón Averiado</option>
                    <option value="Sistema Caído">Sistema Caído</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Descripción</label>
                  <textarea 
                    className="form-control" 
                    rows="5" 
                    placeholder="Describa el suceso..." 
                    value={descripcion}
                    onChange={e=>setDescripcion(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button className="btn btn-danger w-100 fw-bold" disabled={isSending}>
                  {isSending ? 'Enviando...' : 'Registrar Novedad'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Historial */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white fw-bold border-bottom">
              <i className="fas fa-history me-2 text-secondary"></i> Mis Reportes Recientes
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4">Hora</th>
                    <th>Categoría</th>
                    <th>Asunto</th>
                    <th>Detalle</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-5 text-muted">No has realizado reportes hoy.</td></tr>
                  ) : (
                    historial.map((item, idx) => (
                      <tr key={idx}>
                        <td className="ps-4 fw-bold text-secondary">{item.hora}</td>
                        <td><span className="badge bg-secondary">{item.categoria}</span></td>
                        <td className="fw-bold">{item.asunto}</td>
                        <td className="text-truncate" style={{maxWidth: '200px'}} title={item.detalle}>{item.detalle}</td>
                        <td><span className="badge bg-success">Activo</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-4 text-center">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/vigilante/inicio')}>
            <i className="fas fa-arrow-left me-2"></i> Volver al Inicio
        </button>
      </div>

    </div>
  );
};

export default ReportesVigilante;