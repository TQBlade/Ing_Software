import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import CustomTable from '../components/CustomTable.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx';
import ModalForm from '../components/ModalForm.jsx';

const API_URL = 'http://127.0.0.1:5000/api';
const getToken = () => localStorage.getItem('token');

const PersonaForm = ({ formData, handleChange }) => (
  <div className="row g-3">
    <div className="col-md-6"><label className="fw-bold">Documento</label><input className="form-control" name="doc_identidad" value={formData.doc_identidad||''} onChange={handleChange} required/></div>
    <div className="col-md-6"><label className="fw-bold">Nombre</label><input className="form-control" name="nombre" value={formData.nombre||''} onChange={handleChange} required/></div>
    <div className="col-md-6"><label className="fw-bold">Tipo</label><select className="form-select" name="tipo_persona" value={formData.tipo_persona||''} onChange={handleChange}><option value="">Seleccione...</option><option value="ESTUDIANTE">ESTUDIANTE</option><option value="DOCENTE">DOCENTE</option><option value="ADMINISTRATIVO">ADMINISTRATIVO</option><option value="VISITANTE">VISITANTE</option></select></div>
  </div>
);

const PersonasPage = () => {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPersonas = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/personas`, { headers: { Authorization: `Bearer ${getToken()}` } });
      setPersonas(res.data);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPersonas(); }, [fetchPersonas]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      if (editingId) await axios.put(`${API_URL}/personas/${editingId}`, formData, { headers });
      else await axios.post(`${API_URL}/personas`, formData, { headers });

      setIsModalOpen(false); fetchPersonas();
      Swal.fire({ title: 'Guardado', icon: 'success', confirmButtonColor: '#b91c1c' });
    } catch (err) {
      Swal.fire({ title: 'Error', text: err.response?.data?.error, icon: 'error', confirmButtonColor: '#b91c1c' });
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (p) => {
    const res = await Swal.fire({ title: `¿Desactivar a ${p.nombre}?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#b91c1c', confirmButtonText: 'Sí, desactivar' });
    if (res.isConfirmed) {
        setIsSaving(true);
        try {
            await axios.delete(`${API_URL}/personas/${p.id_persona}`, { headers: { Authorization: `Bearer ${getToken()}` } });
            fetchPersonas();
            Swal.fire({ title: 'Desactivado', icon: 'success', confirmButtonColor: '#b91c1c' });
        } catch { Swal.fire({ title: 'Error', icon: 'error', confirmButtonColor: '#b91c1c' }); }
        finally { setIsSaving(false); }
    }
  };

  const handleOpen = (p) => { setEditingId(p?.id_persona); setFormData(p || {}); setIsModalOpen(true); };
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const filtered = personas.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
  const columns = useMemo(() => [{ Header: 'Documento', accessor: 'doc_identidad' }, { Header: 'Nombre', accessor: 'nombre' }, { Header: 'Tipo', accessor: 'tipo_persona' }], []);

  return (
    <div className="container-fluid p-4">
        <LoadingOverlay isLoading={isSaving} message="Procesando..." />
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
            <h1 className="h2 text-gray-800 fw-bold">Personas</h1>
            <button className="btn btn-danger fw-bold" onClick={() => handleOpen(null)}><i className="fas fa-plus me-2"></i> Agregar</button>
        </div>
        <input className="form-control mb-3" placeholder="Buscar..." onChange={e => setSearchTerm(e.target.value)} />
        {loading ? <p>Cargando...</p> : <div className="card shadow-sm"><div className="card-body p-0"><CustomTable columns={columns} data={filtered} onEdit={handleOpen} onDelete={handleDelete} /></div></div>}
        <ModalForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar" : "Nueva"} onSubmit={handleSubmit}><PersonaForm formData={formData} handleChange={handleChange} /></ModalForm>
    </div>
  );
};
export default PersonasPage;