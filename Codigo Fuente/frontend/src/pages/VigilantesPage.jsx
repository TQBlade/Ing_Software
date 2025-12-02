import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2'; // <--- IMPORTANTE
import CustomTable from '../components/CustomTable.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx';
import ModalForm from '../components/ModalForm.jsx';

const API_URL = 'http://127.0.0.1:5000/api';

const VigilanteForm = ({ formData, handleChange }) => (
  <div className="row g-3">
    <div className="col-12"><h6 className="text-primary border-bottom pb-2 fw-bold">Datos Personales</h6></div>
    <div className="col-md-6">
      <label className="fw-bold">Nombre</label>
      <input className="form-control" name="nombre" value={formData.nombre||''} onChange={handleChange} required/>
    </div>
    <div className="col-md-6">
      <label className="fw-bold">Documento</label>
      <input className="form-control" name="doc_identidad" value={formData.doc_identidad||''} onChange={handleChange} required/>
    </div>
    <div className="col-md-6">
      <label className="fw-bold">Teléfono</label>
      <input className="form-control" name="telefono" value={formData.telefono||''} onChange={handleChange} required/>
    </div>
    <div className="col-md-6">
      <label className="fw-bold">Rol</label>
      <select className="form-select" name="id_rol" value={formData.id_rol||''} onChange={handleChange} required>
        <option value="">Seleccione...</option><option value="1">ADMINISTRADOR</option><option value="2">VIGILANTE</option>
      </select>
    </div>
    <div className="col-12 mt-3"><h6 className="text-danger border-bottom pb-2 fw-bold">Credenciales</h6></div>
    <div className="col-md-6">
      <label className="fw-bold">Usuario</label>
      <input className="form-control" name="usuario" value={formData.usuario||''} onChange={handleChange} required/>
    </div>
    <div className="col-md-6">
      <label className="fw-bold">Clave</label>
      <input className="form-control" type="password" name="clave" value={formData.clave||''} onChange={handleChange} />
    </div>
  </div>
);

const VigilantesPage = () => {
  const [vigilantes, setVigilantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const getToken = () => localStorage.getItem('token');

  const fetchVigilantes = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/vigilantes`, { headers: { Authorization: `Bearer ${getToken()}` } });
      setVigilantes(res.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchVigilantes(); }, []);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      if (editingId) await axios.put(`${API_URL}/admin/vigilantes/${editingId}`, formData, { headers });
      else await axios.post(`${API_URL}/admin/registrar_vigilante`, formData, { headers });
      
      setIsModalOpen(false); setFormData({}); fetchVigilantes();
      Swal.fire({ title: '¡Éxito!', text: 'Operación realizada correctamente.', icon: 'success', confirmButtonColor: '#b91c1c' });
    } catch (err) {
      Swal.fire({ title: 'Error', text: 'No se pudo guardar.', icon: 'error', confirmButtonColor: '#b91c1c' });
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (user) => {
    const result = await Swal.fire({
        title: `¿Eliminar a ${user.nombre}?`,
        text: "Se revocará el acceso inmediatamente.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#b91c1c',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
        setIsSaving(true);
        try {
            await axios.delete(`${API_URL}/admin/vigilantes/${user.id_vigilante}`, { headers: { Authorization: `Bearer ${getToken()}` } });
            fetchVigilantes();
            Swal.fire({ title: 'Eliminado', icon: 'success', confirmButtonColor: '#b91c1c' });
        } catch { Swal.fire({ title: 'Error', icon: 'error', confirmButtonColor: '#b91c1c' }); }
        finally { setIsSaving(false); }
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleOpenModal = (u) => { setEditingId(u?.id_vigilante); setFormData(u || {}); setIsModalOpen(true); };

  const columns = useMemo(() => [
    { Header: 'Nombre', accessor: 'nombre' },
    { Header: 'Rol', accessor: 'nombre_rol', Cell: ({value}) => <span className={`badge ${value.includes('ADMIN')?'bg-danger':'bg-primary'}`}>{value}</span> },
    { Header: 'Usuario', accessor: 'usuario' }
  ], []);

  return (
    <div className="container-fluid p-4">
        <LoadingOverlay isLoading={isSaving} message="Procesando..." />
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
            <h1 className="h2 text-gray-800 fw-bold">Gestión de Usuarios</h1>
            <button className="btn btn-danger fw-bold shadow-sm" onClick={() => handleOpenModal(null)}><i className="fas fa-plus me-2"></i> Nuevo</button>
        </div>
        {loading ? <p>Cargando...</p> : <div className="card shadow-sm border-0"><div className="card-body p-0"><CustomTable columns={columns} data={vigilantes} onEdit={handleOpenModal} onDelete={handleDelete} /></div></div>}
        <ModalForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar" : "Nuevo"} onSubmit={handleSubmit}><VigilanteForm formData={formData} handleChange={handleChange} /></ModalForm>
    </div>
  );
};
export default VigilantesPage;