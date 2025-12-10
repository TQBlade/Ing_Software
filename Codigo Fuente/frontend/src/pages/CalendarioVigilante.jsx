import axios from 'axios';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCallback, useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';

// Configuración de localización
const locales = { 'es': es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Configuración de URL (Funciona en Local y Nube)
const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000') + '/api';

const CalendarioVigilante = () => {
  const navigate = useNavigate();
  
  // --- ESTADOS DE NAVEGACIÓN (CRUCIALES PARA QUE LOS BOTONES FUNCIONEN) ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(Views.MONTH);

  // Estados de datos
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Estados para Pico y Placa
  const [placaCheck, setPlacaCheck] = useState('');
  const [picoInfo, setPicoInfo] = useState(null);

  // 1. CARGA DE EVENTOS
  const fetchEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/eventos`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      // Convertir fechas de String ISO a Objeto Date JS
      const parsedEvents = response.data.map(evt => ({
        ...evt,
        start: new Date(evt.start),
        end: new Date(evt.end),
        title: evt.titulo
      }));
      setEvents(parsedEvents);
    } catch (err) { 
      console.error("Error cargando eventos:", err); 
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Manejadores de interacción
  const handleSelectEvent = (event) => setSelectedEvent(event);
  const handleNavigate = (newDate) => setCurrentDate(newDate);
  const handleViewChange = (newView) => setCurrentView(newView);

  // 2. CONSULTA PICO Y PLACA (CÚCUTA)
  const checkPicoPlaca = async (e) => {
      e.preventDefault();
      if(!placaCheck) return;
      try {
          const res = await axios.get(`${API_URL}/pico-placa/${placaCheck}`);
          setPicoInfo(res.data);
      } catch (error) { 
          // Si falla la API, mensaje por defecto
          setPicoInfo({restriccion: false, mensaje: "Error de conexión. Verifique manualmente."});
      }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* ESTILOS INYECTADOS PARA BOTONES */}
      <style>{`
        .rbc-toolbar button { border: 1px solid #ddd; color: #555; }
        .rbc-toolbar button:hover { background-color: #f8f9fa; color: #000; }
        .rbc-toolbar button.rbc-active { background-color: #b91c1c !important; color: white !important; border-color: #b91c1c !important; }
        .rbc-today { background-color: #fff5f5 !important; }
        .rbc-event { border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border:none; }
      `}</style>

      {/* HEADER */}
      <div className="bg-white shadow-sm border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
        <div>
            <h1 className="h4 mb-0 fw-bold text-dark">Agenda Operativa</h1>
            <small className="text-muted">Consulta de eventos y restricciones</small>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/vigilante/gestion')}>
            <i className="fas fa-arrow-left me-2"></i> Volver
        </button>
      </div>

      <div className="flex-grow-1 d-flex bg-light overflow-hidden">
        
        {/* SIDEBAR IZQUIERDA */}
        <div className="bg-white border-end p-3 d-flex flex-column gap-3 overflow-auto" style={{ width: '320px', minWidth: '320px' }}>
            
            {/* WIDGET PICO Y PLACA CÚCUTA */}
            <div className="card shadow-sm border-0 bg-danger text-white">
                <div className="card-body p-3">
                    <h6 className="fw-bold border-bottom border-white pb-2 mb-3">
                        <i className="fas fa-traffic-light me-2"></i>Pico y Placa (Cúcuta)
                    </h6>
                    <form onSubmit={checkPicoPlaca}>
                        <div className="input-group mb-2">
                            <input 
                                type="text" 
                                className="form-control text-uppercase fw-bold text-center border-0 text-danger" 
                                placeholder="ABC-123" 
                                value={placaCheck} 
                                onChange={e=>setPlacaCheck(e.target.value.toUpperCase())} 
                                maxLength={6} 
                            />
                            <button className="btn btn-light fw-bold text-danger" type="submit">VER</button>
                        </div>
                    </form>
                    
                    {picoInfo ? (
                        <div className={`rounded p-2 text-center fw-bold text-small ${picoInfo.restriccion ? 'bg-white text-danger' : 'bg-success text-white'}`}>
                            {picoInfo.restriccion ? '🚫 RESTRICCIÓN' : '✅ HABILITADO'}
                            <div className="small fw-normal mt-1">{picoInfo.mensaje}</div>
                        </div>
                    ) : (
                        <div className="small opacity-75 text-center mt-2" style={{fontSize: '0.8rem'}}>
                            Lunes (1-2), Martes (3-4), Miér (5-6), Jue (7-8), Vie (9-0). <br/> <b>7am - 7pm</b>
                        </div>
                    )}
                </div>
            </div>

            <hr className="my-2"/>

            {/* LISTA DE PRÓXIMOS EVENTOS */}
            <h6 className="text-secondary fw-bold small text-uppercase mb-2">Próximos Eventos</h6>
            <div className="flex-grow-1 overflow-auto pe-1">
                {events.length === 0 ? (
                    <p className="text-muted small text-center italic py-4">No hay eventos programados.</p>
                ) : (
                    events
                    .filter(e => e.start >= new Date()) // Solo futuros
                    .sort((a,b) => a.start - b.start)   // Ordenar por fecha
                    .slice(0, 5)                        // Solo los 5 siguientes
                    .map(e => (
                        <div key={e.id_evento} className="card mb-2 border-0 shadow-sm border-start-4 border-start-danger cursor-pointer hover-shadow" onClick={() => setSelectedEvent(e)}>
                            <div className="card-body p-2">
                                <div className="fw-bold text-dark small">{e.title}</div>
                                <div className="d-flex justify-content-between mt-1 align-items-center">
                                    <span className="text-muted" style={{fontSize: '0.75rem'}}>
                                        <i className="far fa-calendar me-1"></i>
                                        {e.start.toLocaleDateString()}
                                    </span>
                                    <span className={`badge ${e.categoria === 'Mantenimiento' ? 'bg-danger' : 'bg-light text-dark border'}`} style={{fontSize: '0.65rem'}}>
                                        {e.categoria.substring(0, 8)}...
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* CALENDARIO */}
        <div className="flex-grow-1 p-4 h-100 overflow-hidden">
            <div className="card shadow-sm border-0 h-100">
                <div className="card-body p-0 h-100">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        
                        // --- ESTO HACE QUE LOS BOTONES FUNCIONEN ---
                        date={currentDate}
                        view={currentView}
                        onNavigate={handleNavigate}
                        onView={handleViewChange}
                        // -------------------------------------------

                        messages={{ next: "Sig", previous: "Ant", today: "Hoy", month: "Mes", week: "Semana", day: "Día", agenda: "Lista" }}
                        culture='es'
                        onSelectEvent={handleSelectEvent} // Solo ver detalle
                        eventPropGetter={(event) => {
                            let bg = '#0d6efd'; // Azul por defecto
                            if (event.categoria === 'Mantenimiento') bg = '#dc3545'; // Rojo
                            if (event.categoria === 'Evento Masivo') bg = '#ffc107'; // Amarillo
                            return { 
                                style: { 
                                    backgroundColor: bg, 
                                    color: event.categoria === 'Evento Masivo' ? 'black' : 'white',
                                    fontSize: '0.85rem'
                                } 
                            };
                        }}
                    />
                </div>
            </div>
        </div>
      </div>

      {/* MODAL DETALLE (SOLO LECTURA) */}
      {selectedEvent && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold"><i className="fas fa-info-circle me-2"></i>Detalle del Evento</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedEvent(null)}></button>
              </div>
              <div className="modal-body p-4">
                <h5 className="fw-bold mb-3">{selectedEvent.title}</h5>
                
                <div className="row mb-3">
                    <div className="col-6">
                        <label className="small fw-bold text-muted d-block">INICIO</label>
                        <span className="fs-6">{selectedEvent.start.toLocaleString()}</span>
                    </div>
                    <div className="col-6">
                        <label className="small fw-bold text-muted d-block">FIN</label>
                        <span className="fs-6">{selectedEvent.end.toLocaleString()}</span>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="small fw-bold text-muted d-block">UBICACIÓN</label>
                    <span>{selectedEvent.ubicacion || 'General'}</span>
                </div>

                <div className="bg-light p-3 rounded border-start border-4 border-danger">
                    <label className="small fw-bold text-muted d-block mb-1">DESCRIPCIÓN</label>
                    <p className="mb-0 fst-italic text-dark">{selectedEvent.descripcion || 'Sin descripción adicional.'}</p>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button className="btn btn-secondary w-100 fw-bold" onClick={() => setSelectedEvent(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioVigilante;