import axios from 'axios';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCallback, useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import LoadingOverlay from '../components/LoadingOverlay.jsx';

const locales = { 'es': es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000') + '/api';

const CalendarioAdmin = () => {
  const navigate = useNavigate();

  // Estados del calendario
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(Views.MONTH);

  const [events, setEvents] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Formulario
  const [formData, setFormData] = useState({
    id_evento: null,
    title: '',
    descripcion: '',
    start: '',
    end: '',
    ubicacion: '',
    categoria: 'Mantenimiento'
  });

  // Pico y Placa
  const [placaCheck, setPlacaCheck] = useState('');
  const [picoInfo, setPicoInfo] = useState(null);

  // Carga inicial
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
        title: evt.titulo
      }));
      setEvents(parsedEvents);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Helpers
  const dateToInput = (date) => {
      if (!date) return '';
      const offset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const handleNavigate = (newDate) => setCurrentDate(newDate);
  const handleViewChange = (newView) => setCurrentView(newView);

  // Acciones
  const handleSelectSlot = ({ start, end }) => {
    setFormData({
        id_evento: null, title: '', descripcion: '',
        start: dateToInput(start), end: dateToInput(end),
        ubicacion: '', categoria: 'Mantenimiento'
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleSelectEvent = (event) => {
    setFormData({
      id_evento: event.id_evento, title: event.title, descripcion: event.descripcion,
      start: dateToInput(event.start), end: dateToInput(event.end),
      ubicacion: event.ubicacion, categoria: event.categoria
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (new Date(formData.end) <= new Date(formData.start)) {
        return Swal.fire('Error', 'La fecha fin debe ser después del inicio', 'error');
    }
    setIsSaving(true);
    const token = localStorage.getItem('token');
    const endpoint = isEditing ? `${API_URL}/eventos/${formData.id_evento}` : `${API_URL}/eventos`;
    const method = isEditing ? 'put' : 'post';
    try {
      await axios[method](endpoint, { ...formData, titulo: formData.title }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      fetchEvents();
      Swal.fire({ title: 'Guardado', icon: 'success', confirmButtonColor: '#b91c1c', timer: 1500 });
    } catch (err) { Swal.fire('Error', 'No se pudo guardar', 'error'); } 
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    const res = await Swal.fire({
        title: '¿Eliminar evento?', icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#d33', confirmButtonText: 'Sí, eliminar'
    });
    if (res.isConfirmed) {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/eventos/${formData.id_evento}`, { headers: { Authorization: `Bearer ${token}` } });
            setShowModal(false);
            fetchEvents();
            Swal.fire('Eliminado', '', 'success');
        } catch (err) { Swal.fire('Error', 'No se pudo eliminar', 'error'); } 
        finally { setIsSaving(false); }
    }
  };

  const checkPicoPlaca = async (e) => {
      e.preventDefault();
      if(!placaCheck) return;
      try {
          const res = await axios.get(`${API_URL}/pico-placa/${placaCheck}`);
          setPicoInfo(res.data);
      } catch (error) { setPicoInfo({restriccion: false, mensaje: "Error consultando."}); }
  };

  return (
    <div className="d-flex flex-column vh-100 bg-light">
      <LoadingOverlay isLoading={isSaving} message="Procesando..." />

      {/* --- ESTILOS CORREGIDOS --- */}
      <style>{`
        /* 1. MEJORA VISUAL DE LOS EVENTOS EN EL CALENDARIO */
        .rbc-event {
            padding: 4px 8px !important;
            border-radius: 6px !important;
            box-shadow: 0 2px 5px rgba(0,0,0,0.15);
            font-size: 0.9rem;
            line-height: 1.4;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .rbc-event-content {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-weight: 600;
        }

        /* 2. ARREGLO DEL MODAL PARA PANTALLAS PEQUEÑAS (SCROLL) */
        .modal-content {
            max-height: 90vh; /* Máximo 90% de la altura de pantalla */
            display: flex;
            flex-direction: column;
            border-radius: 12px;
            overflow: hidden;
        }
        .modal-body {
            overflow-y: auto; /* Scroll solo en el cuerpo del formulario */
            padding: 20px;
        }
        .modal-header, .modal-footer {
            flex-shrink: 0; /* Header y Footer fijos, no scrollean */
            background-color: #f8f9fa;
        }

        /* Estilos generales calendario */
        .rbc-calendar { background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 20px; }
        .rbc-toolbar button.rbc-active { background-color: #b91c1c !important; color: white !important; }
        .rbc-today { background-color: #fff5f5 !important; }
      `}</style>

      {/* HEADER */}
      <div className="bg-white shadow-sm border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
        <div>
            <h1 className="h4 mb-0 fw-bold text-danger"><i className="fas fa-calendar-check me-2"></i>Gestión de Calendario</h1>
            <small className="text-muted">Administración de eventos y mantenimiento</small>
        </div>
        <button className="btn btn-outline-danger btn-sm fw-bold" onClick={() => navigate('/admin/gestion_a')}>
            <i className="fas fa-arrow-left me-2"></i> Volver al Panel
        </button>
      </div>

      <div className="flex-grow-1 d-flex overflow-hidden">
        
        {/* SIDEBAR */}
        <div className="bg-white border-end p-3 overflow-auto" style={{ width: '300px', minWidth: '300px' }}>
            <div className="card border-danger shadow-sm mb-3">
                <div className="card-header bg-danger text-white fw-bold small">
                    <i className="fas fa-car-side me-2"></i>Pico y Placa (Cúcuta)
                </div>
                <div className="card-body p-3">
                    <form onSubmit={checkPicoPlaca}>
                        <div className="input-group input-group-sm mb-2">
                            <input className="form-control text-uppercase fw-bold text-center" placeholder="ABC-123" value={placaCheck} onChange={e=>setPlacaCheck(e.target.value.toUpperCase())} maxLength={6} />
                            <button className="btn btn-danger" type="submit">OK</button>
                        </div>
                    </form>
                    {picoInfo && <div className={`alert ${picoInfo.restriccion ? 'alert-danger' : 'alert-success'} p-2 small mb-0 fw-bold`}>{picoInfo.mensaje}</div>}
                </div>
            </div>

            <h6 className="text-secondary fw-bold small text-uppercase">Leyenda</h6>
            <ul className="list-group list-group-flush small">
                <li className="list-group-item px-0 border-0"><span className="badge bg-danger me-2">●</span> Mantenimiento</li>
                <li className="list-group-item px-0 border-0"><span className="badge bg-warning text-dark me-2">●</span> Evento Masivo</li>
                <li className="list-group-item px-0 border-0"><span className="badge bg-primary me-2">●</span> Institucional</li>
            </ul>
        </div>

        {/* CALENDARIO */}
        <div className="flex-grow-1 p-4 bg-light overflow-auto">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%', minHeight: '500px' }}
                date={currentDate}
                view={currentView}
                onNavigate={handleNavigate}
                onView={handleViewChange}
                messages={{ next: "Sig", previous: "Ant", today: "Hoy", month: "Mes", week: "Semana", day: "Día", agenda: "Agenda" }}
                culture='es'
                selectable={true}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={(event) => {
                    let bg = '#0d6efd';
                    if (event.categoria === 'Mantenimiento') bg = '#dc3545';
                    if (event.categoria === 'Evento Masivo') bg = '#ffc107'; 
                    return { style: { backgroundColor: bg, color: event.categoria==='Evento Masivo'?'black':'white' } };
                }}
            />
        </div>
      </div>

      {/* MODAL CORREGIDO (CON SCROLL INTERNO) */}
      {showModal && (
        <>
            <div className="modal-backdrop show" style={{zIndex: 1040}}></div>
            <div className="modal d-block" style={{zIndex: 1050}} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content shadow-lg border-0">
                
                {/* Header Fijo */}
                <div className="modal-header bg-danger text-white py-3">
                    <h5 className="modal-title fw-bold">
                        {isEditing ? <><i className="fas fa-edit me-2"></i>Editar Evento</> : <><i className="fas fa-plus-circle me-2"></i>Nuevo Evento</>}
                    </h5>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                
                {/* Body con Scroll */}
                <form onSubmit={handleSave} className="d-flex flex-column" style={{overflow: 'hidden'}}>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="fw-bold form-label text-secondary">Título del Evento</label>
                            <input className="form-control form-control-lg" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ej: Cierre Entrada Norte" />
                        </div>
                        
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="small fw-bold text-muted">Fecha Inicio</label>
                                <input type="datetime-local" className="form-control" required value={formData.start} onChange={e => setFormData({...formData, start: e.target.value})} />
                            </div>
                            <div className="col-md-6">
                                <label className="small fw-bold text-muted">Fecha Fin</label>
                                <input type="datetime-local" className="form-control" required value={formData.end} onChange={e => setFormData({...formData, end: e.target.value})} />
                            </div>
                        </div>

                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="fw-bold form-label text-secondary">Categoría</label>
                                <select className="form-select" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                                    <option value="Mantenimiento">🔴 Mantenimiento</option>
                                    <option value="Evento Masivo">🟠 Evento Masivo</option>
                                    <option value="Institucional">🔵 Institucional</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="fw-bold form-label text-secondary">Ubicación</label>
                                <input className="form-control" value={formData.ubicacion} onChange={e => setFormData({...formData, ubicacion: e.target.value})} placeholder="Ej: Bloque B" />
                            </div>
                        </div>

                        <div className="mb-0">
                            <label className="fw-bold form-label text-secondary">Descripción</label>
                            <textarea className="form-control" rows="4" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} placeholder="Detalles adicionales del evento..."></textarea>
                        </div>
                    </div>

                    {/* Footer Fijo */}
                    <div className="modal-footer bg-light py-3">
                        {isEditing && (
                            <button type="button" className="btn btn-outline-dark me-auto" onClick={handleDelete}>
                                <i className="fas fa-trash me-2"></i>Eliminar
                            </button>
                        )}
                        <button type="button" className="btn btn-secondary px-4" onClick={() => setShowModal(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-danger fw-bold px-4 shadow-sm">
                            <i className="fas fa-save me-2"></i>Guardar Evento
                        </button>
                    </div>
                </form>
                </div>
            </div>
            </div>
        </>
      )}
    </div>
  );
};

export default CalendarioAdmin;