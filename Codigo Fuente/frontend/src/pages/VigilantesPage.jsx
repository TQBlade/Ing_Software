import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import CustomTable from '../components/CustomTable.jsx';
import ModalForm from '../components/ModalForm.jsx';

const API_URL = 'http://127.0.0.1:5000/api';

// --- FORMULARIO ---
const VigilanteForm = ({ formData, handleChange, isEditing }) => (
  <div className="row g-3">
    <div className="col-12"><h6 className="text-primary border-bottom pb-2 fw-bold">Datos Personales</h6></div>
    <div className="col-md-6">
      <label className="form-label fw-bold">Nombre</label>
      <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleChange} required className="form-control" />
    </div>
    <div className="col-md-6">
      <label className="form-label fw-bold">Documento</label>
      <input type="text" name="doc_identidad" value={formData.doc_identidad || ''} onChange={handleChange} required className="form-control" />
    </div>
    <div className="col-md-6">
      <label className="form-label fw-bold">Teléfono</label>
      <input type="text" name="telefono" value={formData.telefono || ''} onChange={handleChange} required className="form-control" />
    </div>
    <div className="col-md-6">
      <label className="form-label fw-bold">Rol</label>
      <select name="id_rol" value={formData.id_rol || ''} onChange={handleChange} required className="form-select">
        <option value="">Seleccione...</option>
        <option value="1">ADMINISTRADOR</option>
        <option value="2">VIGILANTE</option>
      </select>
    </div>

    <div className="col-12 mt-3"><h6 className="text-danger border-bottom pb-2 fw-bold">Credenciales</h6></div>
    <div className="col-md-6">
      <label className="form-label fw-bold">Usuario</label>
      <input type="text" name="usuario" value={formData.usuario || ''} onChange={handleChange} required className="form-control" />
    </div>
    <div className="col-md-6">
      <label className="form-label fw-bold">{isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}</label>
      <input type="password" name="clave" value={formData.clave || ''} onChange={handleChange} required={!isEditing} className="form-control" placeholder={isEditing ? "Dejar vacío para no cambiar" : ""} />
    </div>
  </div>
);

const VigilantesPage = () => {
  const [vigilantes, setVigilantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null); // ID si estamos editando
  
  const getToken = () => localStorage.getItem('token');

  const fetchVigilantes = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/vigilantes`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setVigilantes(response.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVigilantes(); }, []);

  // --- ABRIR MODAL (CREAR O EDITAR) ---
  const handleOpenModal = (user = null) => {
    if (user) {
        // Modo Edición
        setEditingId(user.id_vigilante);
        setFormData({
            nombre: user.nombre,
            doc_identidad: user.doc_identidad,
            telefono: user.telefono,
            id_rol: user.id_rol,
            usuario: user.usuario,
            clave: '' // No mostramos la clave por seguridad
        });
    } else {
        // Modo Crear
        setEditingId(null);
        setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      
      if (editingId) {
        // UPDATE
        await axios.put(`${API_URL}/admin/vigilantes/${editingId}`, formData, { headers });
        alert("✅ Usuario actualizado.");
      } else {
        // CREATE
        await axios.post(`${API_URL}/admin/registrar_vigilante`, formData, { headers });
        alert("✅ Usuario creado.");
      }
      
      setIsModalOpen(false);
      fetchVigilantes();
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || "Operación fallida"));
    }
  };

  const handleDelete = async (user) => {
    if(!window.confirm(`¿Eliminar acceso a ${user.nombre}?`)) return;
    try {
        await axios.delete(`${API_URL}/admin/vigilantes/${user.id_vigilante}`, {
            headers: { Authorization: `Bearer ${getToken()}` }
        });
        alert("🗑️ Usuario eliminado.");
        fetchVigilantes();
    } catch (err) { alert("Error eliminando."); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- COLUMNAS (SIN USUARIO NI CLAVE) ---
  const columns = useMemo(() => [
    { Header: 'Nombre', accessor: 'nombre' },
    { Header: 'Documento', accessor: 'doc_identidad' },
    { Header: 'Teléfono', accessor: 'telefono' },
    { 
      Header: 'Rol', 
      accessor: 'nombre_rol', 
      Cell: ({value}) => <span className={`badge ${value.toUpperCase().includes('ADMIN') ? 'bg-danger' : 'bg-primary'}`}>{value}</span> 
    },
  ], []);

  return (
    <div className="container-fluid p-4">
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
            <h1 className="h2 text-gray-800 fw-bold">Gestión de Personal</h1>
            <button className="btn btn-success fw-bold shadow-sm" onClick={() => handleOpenModal(null)}>
                <i className="fas fa-plus-circle me-2"></i> Nuevo Usuario
            </button>
        </div>

        {loading ? <div className="text-center p-5">Cargando...</div> : (
            <div className="card shadow border-0">
                <div className="card-body p-0">
                    <CustomTable 
                        columns={columns} 
                        data={vigilantes} 
                        onEdit={handleOpenModal}   // Habilita botón editar
                        onDelete={handleDelete}    // Habilita botón eliminar
                    />
                </div>
            </div>
        )}

        <ModalForm 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            title={editingId ? "Editar Usuario" : "Registrar Usuario"}
            onSubmit={handleSubmit}
            submitText={editingId ? "Guardar Cambios" : "Crear Usuario"}
        >
            <VigilanteForm formData={formData} handleChange={handleChange} isEditing={!!editingId} />
        </ModalForm>
    </div>
  );
};

export default VigilantesPage;