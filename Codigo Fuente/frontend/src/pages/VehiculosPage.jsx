import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios'; // Asegúrate de tenerlo instalado (npm install axios)

// Importa tus componentes genéricos
import CustomTable from '../components/CustomTable.jsx';
import ModalForm from '../components/ModalForm.jsx';

// --- API Logic (integrada en la página) ---
const API_URL = 'http://127.0.0.1:5000/api'; // URL Base

const getToken = () => localStorage.getItem('token');

const getVehiculos = async () => {
    const response = await axios.get(`${API_URL}/vehiculos`, {
        headers: { Authorization: `Bearer ${getToken()}` }
    });
    return response.data;
};

const createVehiculo = async (data) => {
    const response = await axios.post(`${API_URL}/vehiculos`, data, {
        headers: { Authorization: `Bearer ${getToken()}` }
    });
    return response.data;
};

const updateVehiculo = async (id, data) => {
    const response = await axios.put(`${API_URL}/vehiculos/${id}`, data, {
        headers: { Authorization: `Bearer ${getToken()}` }
    });
    return response.data;
};

const deleteVehiculo = async (id) => {
    const response = await axios.delete(`${API_URL}/vehiculos/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
    });
    return response.data;
};



// --- Formulario Interno ---
const TIPO_VEHICULO = ['Automovil', 'Motocicleta', 'Bicicleta']; // Asumido

const VehiculoForm = ({ formData, handleChange }) => (
  <div className="row g-3">
    <div className="col-md-6">
      <label htmlFor="placa" className="form-label">Placa</label>
      <input
        type="text" id="placa" name="placa"
        value={formData.placa || ''} onChange={handleChange}
        required className="form-control"
      />
    </div>
    <div className="col-md-6">
      <label htmlFor="id_persona" className="form-label">ID del Propietario</label>
      <input
        type="number" id="id_persona" name="id_persona"
        value={formData.id_persona || ''} onChange={handleChange}
        required min="1" className="form-control"
      />
    </div>
    <div className="col-md-6">
      <label htmlFor="tipo" className="form-label">Tipo de Vehículo</label>
      <select
        id="tipo" name="tipo"
        value={formData.tipo || ''} onChange={handleChange}
        required className="form-select"
      >
        <option value="">Seleccione...</option>
        {TIPO_VEHICULO.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
      </select>
    </div>
    <div className="col-md-6">
      <label htmlFor="color" className="form-label">Color</label>
      <input
        type="text" id="color" name="color"
        value={formData.color || ''} onChange={handleChange}
        className="form-control"
      />
    </div>
  </div>
);

// --- Componente Principal de la Página ---
const VehiculosPage = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState(null); 
  const [formData, setFormData] = useState({}); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchVehiculos = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getVehiculos();
      setVehiculos(data);
      setError(null);
    } catch (err) {
      console.error("Error cargando vehículos:", err);
      setError(err.response?.data?.error || err.message || "Error al cargar vehículos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehiculos();
  }, [fetchVehiculos]);

  // --- Manejadores de Modal y Formulario ---
  const handleOpenModal = (vehiculo = null) => {
    setEditingVehiculo(vehiculo);
    setFormData(vehiculo ? { ...vehiculo, id_persona: vehiculo.id_persona } : {});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVehiculo(null);
    setFormData({});
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setError(null);
    try {
      if (!formData.placa || !formData.id_persona || !formData.tipo) {
          throw new Error("Placa, ID Propietario y Tipo son obligatorios.");
      }
      const dataToSend = { ...formData, id_persona: parseInt(formData.id_persona, 10) };

      if (editingVehiculo) {
        await updateVehiculo(editingVehiculo.id_vehiculo, dataToSend);
      } else {
        await createVehiculo(dataToSend);
      }
      
      handleCloseModal();
      fetchVehiculos(); // Recargar datos
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      setError(errorMessage);
      console.error(err);
      // No cerramos el modal si falla, para que el usuario vea el error
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (vehiculo) => { // 1. Recibe el objeto 'vehiculo'
    // 2. Extrae el ID del objeto
    const id_vehiculo = vehiculo.id_vehiculo; 

    if (window.confirm(`¿Estás seguro de que deseas ELIMINAR PERMANENTEMENTE el vehículo ${vehiculo.placa}?`)) {
      try {
        await deleteVehiculo(id_vehiculo); // 3. Pasa solo el ID
        alert("Vehículo eliminado exitosamente");
        fetchVehiculos(); // Recarga la tabla
      } catch (err) {
        console.error("Error al eliminar vehículo:", err);
        alert("Error al eliminar vehículo.");
      }
    }
  };
  
  // --- Definición de Columnas (Ajustado a tu imagen) ---
  const columns = useMemo(() => [
    { Header: 'Placa', accessor: 'placa' },
    // NOTA: 'Marca' y 'Modelo' no están en la BD (según el informe ).
    // Si estuvieran, los añadirías aquí.
    { Header: 'Tipo', accessor: 'tipo' },
    { Header: 'Color', accessor: 'color' },
    { Header: 'Nombre Propietario', accessor: 'propietario.nombre' },
  ], [fetchVehiculos]); // Dependencias vacías, se recalcula solo una vez

  // Filtrado de la tabla (como en tu imagen)
  const filteredVehiculos = vehiculos.filter(v =>
    v.placa.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="container-fluid p-4">
    
      {/* 1. Encabezado (como en tu imagen) */}
      <div className="d-flex justify-content-between align-items-center pb-2 mb-4" 
           style={{ borderBottom: '3px solid #dc3545' }}>
        <h1 className="h2 mb-0" style={{color: '#3a3b45', fontWeight: 700}}>Gestión de Vehículos</h1>
      </div>

      {/* 2. Barra de Herramientas (como en tu imagen) */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        
        {/* Input de Búsqueda */}
        <div className="input-group" style={{ maxWidth: '350px' }}>
          <span className="input-group-text" id="basic-addon1">
            <i className="fas fa-search"></i> {/* Asumiendo FontAwesome */}
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Botón de Agregar */}
        <button
          onClick={() => handleOpenModal(null)}
          className="btn btn-danger"
          style={{fontWeight: 600}}
        >
          Agregar Vehículo
        </button>
      </div>

      {/* 3. Tabla de Datos */}
      {isLoading ? (
        <div className="text-center p-5">Cargando vehículos...</div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <CustomTable
              columns={columns}
              data={filteredVehiculos}
              // Pasamos las funciones de acción a CustomTable (si las usa)
              onEdit={handleOpenModal}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

      {/* 4. Modal de Creación/Edición */}
      <ModalForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingVehiculo ? 'Editar Vehículo' : 'Crear Nuevo Vehículo'}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        error={error} // Pasa el error al modal para que lo muestre
      >
        <VehiculoForm 
            formData={formData} 
            handleChange={handleChange} 
        />
      </ModalForm>
    </div>
  );
};
export default VehiculosPage;