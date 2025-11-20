import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es'; // Idioma Español
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Configuración de idioma para el calendario
const locales = { 'es': es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const API_URL = 'http://127.0.0.1:5000/api';

// --- COMPONENTE PRINCIPAL ---
const CalendarAdmin = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  
  // Estado para el Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id_evento: null,
    titulo: '',
    descripcion: '',
    start: '',
    end: '',
    ubicacion: '',
    categoria: 'Mantenimiento'
  });

  // Cargar eventos
  const fetchEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/eventos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Convertir strings ISO a objetos Date (Requisito de react-big-calendar)
      const parsedEvents = response.data.map(evt => ({
        ...evt,
        start: new Date(evt.start),
        end: new Date(evt.end),
      }));
      setEvents(parsedEvents);
    } catch (err) {
      console.error("Error cargando eventos:", err);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // --- Manejadores de Acción ---

  // Clic en un espacio vacío (Crear)
  const handleSelectSlot = ({ start, end }) => {
    setFormData({
      id_evento: null,
      titulo: '',
      descripcion: '',
      start: start.toISOString().slice(0, 16), // Formato para input datetime-local
      end: end.toISOString().slice(0, 16),
      ubicacion: '',
      categoria: 'Mantenimiento'
    });
    setIsEditing(false);
    setShowModal(true);
  };

  // Clic en un evento existente (Editar)
  const handleSelectEvent = (event) => {
    setFormData({
      id_evento: event.id_evento,
      titulo: event.titulo,
      descripcion: event.descripcion,
      start: new Date(event.start).toISOString().slice(0, 16),
      end: new Date(event.end).toISOString().slice(0, 16),
      ubicacion: event.ubicacion,
      categoria: event.categoria
    });
    setIsEditing(true);
    setShowModal(true);
  };

  // Guardar (Crear o Actualizar)
  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const endpoint = isEditing ? `${API_URL}/eventos/${formData.id_evento}` : `${API_URL}/eventos`;
    const method = isEditing ? 'put' : 'post';

    try {
      await axios[method](endpoint, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      fetchEvents(); // Recargar calendario
    } catch (err) {
      alert("Error al guardar el evento");
    }
  };

  // Eliminar
  const handleDelete = async () => {
    if (window.confirm("¿Eliminar este evento permanentemente?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/eventos/${formData.id_evento}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setShowModal(false);
        fetchEvents();
      } catch (err) {
        alert("Error al eliminar");
      }
    }
  };

  // --- Estilos Dinámicos por Categoría ---
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad'; // Default Azul
    if (event.categoria === 'Mantenimiento') backgroundColor = '#f6c23e'; // Amarillo
    if (event.categoria === 'Evento Masivo') backgroundColor = '#e74a3b'; // Rojo
    if (event.categoria === 'Institucional') backgroundColor = '#1cc88a'; // Verde
    
    return { style: { backgroundColor } };
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center pb-2 mb-4 border-bottom">
        <h1 className="h2 text-gray-800">Calendario de Eventos (Admin)</h1>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/admin/gestion_a')}>
           Volver
        </button>
      </div>

      <div className="card shadow-sm p-3" style={{ height: '80vh' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          messages={{
            next: "Sig", previous: "Ant", today: "Hoy", month: "Mes", week: "Semana", day: "Día"
          }}
          culture='es'
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
        />
      </div>

      {/* --- MODAL (Bootstrap Simple) --- */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">{isEditing ? 'Editar Evento' : 'Nuevo Evento'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Título</label>
                    <input className="form-control" required value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} />
                  </div>
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label">Inicio</label>
                      <input type="datetime-local" className="form-control" required value={formData.start} onChange={e => setFormData({...formData, start: e.target.value})} />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label">Fin</label>
                      <input type="datetime-local" className="form-control" required value={formData.end} onChange={e => setFormData({...formData, end: e.target.value})} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Categoría</label>
                    <select className="form-select" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                        <option value="Mantenimiento">Mantenimiento (Amarillo)</option>
                        <option value="Evento Masivo">Evento Masivo (Rojo)</option>
                        <option value="Institucional">Institucional (Verde)</option>
                        <option value="Otro">Otro (Azul)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ubicación</label>
                    <input className="form-control" placeholder="Ej: Parqueadero Norte" value={formData.ubicacion} onChange={e => setFormData({...formData, ubicacion: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea className="form-control" rows="3" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})}></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  {isEditing && (
                      <button type="button" className="btn btn-danger me-auto" onClick={handleDelete}>Eliminar</button>
                  )}
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarAdmin;