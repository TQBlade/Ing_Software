import axios from 'axios';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCallback, useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from '../components/LoadingOverlay.jsx'; // <--- IMPORTANTE

const locales = { 'es': es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const API_URL = 'http://127.0.0.1:5000/api';

const CalendarioAdmin = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isSaving, setIsSaving] = useState(false); // <--- ESTADO DE CARGA
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id_evento: null, title: '', descripcion: '', start: '', end: '', ubicacion: '', categoria: 'Mantenimiento' });

  const fetchEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/eventos`, { headers: { Authorization: `Bearer ${token}` } });
      const parsedEvents = response.data.map(evt => ({ ...evt, start: new Date(evt.start), end: new Date(evt.end) }));
      setEvents(parsedEvents);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleSelectSlot = ({ start, end }) => {
    // Ajuste de zona horaria local
    const toLocalISO = (date) => {
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    };
    setFormData({ id_evento: null, title: '', descripcion: '', start: toLocalISO(start), end: toLocalISO(end), ubicacion: '', categoria: 'Mantenimiento' });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleSelectEvent = (event) => {
    const toLocalISO = (date) => {
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    };
    setFormData({
      id_evento: event.id_evento, title: event.titulo, descripcion: event.descripcion,
      start: toLocalISO(event.start),
      end: toLocalISO(event.end),
      ubicacion: event.ubicacion, categoria: event.categoria
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true); // <--- ON
    const token = localStorage.getItem('token');
    const endpoint = isEditing ? `${API_URL}/eventos/${formData.id_evento}` : `${API_URL}/eventos`;
    const method = isEditing ? 'put' : 'post';
    try {
      await axios[method](endpoint, { ...formData, titulo: formData.title }, { headers: { Authorization: `Bearer ${token}` } });
      setShowModal(false);
      fetchEvents();
      alert("✅ Evento guardado");
    } catch (err) { alert("Error al guardar"); }
    finally { setIsSaving(false); } // <--- OFF
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar evento?")) return;
    setIsSaving(true); // <--- ON
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/eventos/${formData.id_evento}`, { headers: { Authorization: `Bearer ${token}` } });
        setShowModal(false);
        fetchEvents();
        alert("🗑️ Evento eliminado");
    } catch (err) { alert("Error al eliminar"); }
    finally { setIsSaving(false); } // <--- OFF
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <LoadingOverlay isLoading={isSaving} message="Actualizando calendario..." />
      
      <div className="bg-white shadow-sm border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
        <h1 className="h4 mb-0 fw-bold">Gestión de Eventos</h1>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/admin/gestion_a')}>Volver</button>
      </div>

      <div className="flex-grow-1 p-3">
        <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            messages={{ next: "Sig", previous: "Ant", today: "Hoy", month: "Mes", week: "Semana", day: "Día" }}
            culture='es'
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
        />
      </div>

      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">{isEditing ? 'Editar Evento' : 'Nuevo Evento'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <input className="form-control mb-2 fw-bold" placeholder="Título del evento" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  <div className="row g-2 mb-2">
                    <div className="col-6"><input type="datetime-local" className="form-control" required value={formData.start} onChange={e => setFormData({...formData, start: e.target.value})} /></div>
                    <div className="col-6"><input type="datetime-local" className="form-control" required value={formData.end} onChange={e => setFormData({...formData, end: e.target.value})} /></div>
                  </div>
                  <select className="form-select mb-2" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                        <option value="Mantenimiento">Mantenimiento</option>
                        <option value="Evento Masivo">Evento Masivo</option>
                        <option value="Institucional">Institucional</option>
                  </select>
                  <textarea className="form-control" rows="3" placeholder="Descripción..." value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})}></textarea>
                </div>
                <div className="modal-footer">
                  {isEditing && <button type="button" className="btn btn-outline-danger me-auto" onClick={handleDelete}>Eliminar</button>}
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-danger">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioAdmin;