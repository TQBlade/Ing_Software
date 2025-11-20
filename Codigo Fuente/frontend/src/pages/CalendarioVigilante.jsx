import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const locales = { 'es': es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const API_URL = 'http://127.0.0.1:5000/api';

const CalendarVigilante = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/eventos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const parsedEvents = response.data.map(evt => ({
        ...evt,
        start: new Date(evt.start),
        end: new Date(evt.end),
      }));
      setEvents(parsedEvents);
    } catch (err) {
      console.error("Error cargando eventos");
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleVerify = async () => {
    if (!selectedEvent) return;
    try {
      const token = localStorage.getItem('token');
      // Cambia el estado de verificado a True
      await axios.put(`${API_URL}/eventos/${selectedEvent.id_evento}/verificar`, 
        { verificado: true }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Evento marcado como verificado/en curso.");
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      alert("Error al verificar evento");
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    if (event.categoria === 'Mantenimiento') backgroundColor = '#f6c23e';
    if (event.categoria === 'Evento Masivo') backgroundColor = '#e74a3b';
    if (event.categoria === 'Institucional') backgroundColor = '#1cc88a';
    
    // Si ya está verificado, le ponemos un borde verde brillante
    const style = { backgroundColor };
    if (event.verificado) {
        style.border = "3px solid #00ff00";
    }
    return { style };
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center pb-2 mb-4 border-bottom">
        <h1 className="h2 text-gray-800">Calendario Operativo</h1>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/vigilante/gestion')}>Volver</button>
      </div>

      <div className="card shadow-sm p-3" style={{ height: '80vh' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          messages={{ next: "Sig", previous: "Ant", today: "Hoy", month: "Mes", week: "Semana", day: "Día" }}
          culture='es'
          onSelectEvent={handleSelectEvent} // Solo seleccionar, no crear
          eventPropGetter={eventStyleGetter}
        />
      </div>

      {/* --- MODAL DE DETALLES (SOLO LECTURA) --- */}
      {showModal && selectedEvent && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">{selectedEvent.titulo}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Categoría:</strong> {selectedEvent.categoria}</p>
                <p><strong>Ubicación:</strong> {selectedEvent.ubicacion || 'No especificada'}</p>
                <p><strong>Inicio:</strong> {selectedEvent.start.toLocaleString()}</p>
                <p><strong>Fin:</strong> {selectedEvent.end.toLocaleString()}</p>
                <hr />
                <p className="text-muted">{selectedEvent.descripcion || 'Sin descripción'}</p>
                
                {selectedEvent.verificado ? (
                    <div className="alert alert-success mt-3 mb-0">✅ Este evento ya fue verificado.</div>
                ) : (
                    <div className="alert alert-warning mt-3 mb-0">⚠️ Pendiente de verificación.</div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
                {!selectedEvent.verificado && (
                    <button type="button" className="btn btn-success" onClick={handleVerify}>
                        <i className="fas fa-check me-2"></i> Confirmar Inicio
                    </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarVigilante;