import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import CustomTable from '../components/CustomTable.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx';
import ModalForm from '../components/ModalForm.jsx';

const API_URL = 'http://127.0.0.1:5000/api';
const getToken = () => localStorage.getItem('token');

const VehiculoForm = ({ formData, handleChange }) => (
  <div className="row g-3">
    <div className="col-md-6"><label className="fw-bold">Placa</label><input className="form-control text-uppercase" name="placa" value={formData.placa||''} onChange={handleChange} required placeholder="AAA123"/></div>
    <div className="col-md-6"><label className="fw-bold">ID Propietario</label><input type="number" className="form-control" name="id_persona" value={formData.id_persona||''} onChange={handleChange} required/></div>
    <div className="col-md-6"><label className="fw-bold">Tipo</label><select className="form-select" name="tipo" value={formData.tipo||''} onChange={handleChange}><option value="">Seleccione...</option><option value="Automovil">Automóvil</option><option value="Motocicleta">Motocicleta</option></select></div>
    <div className="col-md-6"><label className="fw-bold">Color</label><input className="form-control" name="color" value={formData.color||''} onChange={handleChange}/></div>
  </div>
);

const VehiculosPage = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  
  // PAGINACIÓN
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  const fetchVehiculos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/vehiculos`, { headers: { Authorization: `Bearer ${getToken()}` } });
      setVehiculos(res.data);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchVehiculos(); }, [fetchVehiculos]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const payload = { ...formData, id_persona: parseInt(formData.id_persona), placa: formData.placa.toUpperCase() };
      
      if (editingId) await axios.put(`${API_URL}/vehiculos/${editingId}`, payload, { headers });
      else await axios.post(`${API_URL}/vehiculos`, payload, { headers });

      setIsModalOpen(false); fetchVehiculos();
      Swal.fire({ title: 'Guardado', icon: 'success', confirmButtonColor: '#b91c1c' });
    } catch (err) {
      Swal.fire({ title: 'Error', text: err.response?.data?.error || 'Error. Verifique propietario.', icon: 'error', confirmButtonColor: '#b91c1c' });
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (vehiculo) => {
    const res = await Swal.fire({
        title: `¿Eliminar ${vehiculo.placa}?`,
        icon: 'warning', showCancelButton: true, confirmButtonColor: '#b91c1c', confirmButtonText: 'Sí, eliminar'
    });
    if (res.isConfirmed) {
        setIsSaving(true);
        try {
            await axios.delete(`${API_URL}/vehiculos/${vehiculo.id_vehiculo}`, { headers: { Authorization: `Bearer ${getToken()}` } });
            fetchVehiculos();
            Swal.fire({ title: 'Eliminado', icon: 'success', confirmButtonColor: '#b91c1c' });
        } catch { Swal.fire({ title: 'Error', icon: 'error', confirmButtonColor: '#b91c1c' }); }
        finally { setIsSaving(false); }
    }
  };

  const handleOpen = (v) => { setEditingId(v?.id_vehiculo); setFormData(v || {}); setIsModalOpen(true); };
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- LÓGICA DE DATOS PROCESADOS ---
  const processedData = useMemo(() => {
    let data = [...vehiculos];

    if (searchTerm) {
        data = data.filter(v => v.placa.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    // Ordenar por ID Vehiculo (Descendente)
    data.sort((a, b) => b.id_vehiculo - a.id_vehiculo);
    
    return data;
  }, [vehiculos, searchTerm]);

  // Cálculos Paginación
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  }, [totalItems, currentPage, totalPages]);

  const currentItems = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = useMemo(() => [
    { Header: 'Placa', accessor: 'placa', Cell: ({value}) => <span className="fw-bold text-dark">{value}</span> },
    { Header: 'Tipo', accessor: 'tipo' },
    { Header: 'Color', accessor: 'color' },
    { Header: 'Propietario', accessor: 'propietario.nombre' },
  ], []);

  return (
    <div className="container-fluid p-4">
        <LoadingOverlay isLoading={isSaving} message="Guardando..." />
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
            <h1 className="h2 text-gray-800 fw-bold">Gestión de Vehículos</h1>
            <button className="btn btn-primary fw-bold" onClick={() => handleOpen(null)}><i className="fas fa-car me-2"></i> Agregar</button>
        </div>
        
        <input 
            className="form-control mb-3" 
            placeholder="Buscar placa..." 
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
        />
        
        {loading ? <div className="text-center p-5"><div className="spinner-border text-primary"></div></div> : (
            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <CustomTable columns={columns} data={currentItems} onEdit={handleOpen} onDelete={handleDelete} />
                </div>
                
                {/* FOOTER PAGINACIÓN */}
                {totalItems > 0 && (
                    <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
                        <span className="text-muted small">
                            Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}
                        </span>
                        <nav>
                            <ul className="pagination pagination-sm mb-0">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>Anterior</button>
                                </li>
                                <li className="page-item active">
                                    <span className="page-link">{currentPage}</span>
                                </li>
                                <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Siguiente</button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        )}
        <ModalForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar" : "Nuevo"} onSubmit={handleSubmit}><VehiculoForm formData={formData} handleChange={handleChange} /></ModalForm>
    </div>
  );
};
export default VehiculosPage;