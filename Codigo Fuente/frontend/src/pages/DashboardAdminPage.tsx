import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
// Reutilizamos los mismos estilos del dashboard que ya migramos
import styles from './DashboardVigilantePage.module.css'; 

// Definimos la URL de la API
const API_URL = 'http://127.0.0.1:5000/api';

// --- Definición de tipos para los datos ---
interface IResumen {
  total_vehiculos: number;
  total_accesos: number;
  total_alertas: number;
}

interface IAcceso {
  placa: string;
  tipo: string;
  color: string;
  propietario: string;
  resultado: string;
}

interface IUserInfo {
  nombre?: string;
  rol?: string;
}

const DashboardAdminPage: React.FC = () => {
  const navigate = useNavigate();

  // --- Estados para los datos del dashboard ---
  const [userInfo, setUserInfo] = useState<IUserInfo>({});
  const [resumen, setResumen] = useState<IResumen>({ total_vehiculos: 0, total_accesos: 0, total_alertas: 0 });
  const [accesos, setAccesos] = useState<IAcceso[]>([]);

  // --- Estados para el formulario de registro ---
  const [nombreVigilante, setNombreVigilante] = useState('');
  const [docVigilante, setDocVigilante] = useState('');
  const [telefonoVigilante, setTelefonoVigilante] = useState('');
  const [rolVigilante, setRolVigilante] = useState('1'); // Valor por defecto

  // --- Lógica de Autenticación y Cierre de Sesión ---
  // (Lógica adaptada de dashboard_admin.js)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUserInfo = JSON.parse(localStorage.getItem("user_info") || "{}");

    if (!token || storedUserInfo.rol !== "Administrador") {
      navigate("/login"); // Si no hay token o no es Admin, fuera
      return;
    }
    setUserInfo(storedUserInfo);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_info");
    navigate("/login");
  };

  // --- Lógica de Carga de Datos del Dashboard ---
  // (Adaptado de dashboard_admin.js)
  const cargarDatosDashboard = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // 1. Cargar Resumen
      // (El JS original no usaba token, pero es buena práctica)
      const resResumen = await axios.get(`${API_URL}/admin/resumen`, config);
      setResumen(resResumen.data);

      // 2. Cargar Accesos
      const resAccesos = await axios.get(`${API_URL}/admin/accesos`, config);
      setAccesos(resAccesos.data);

    } catch (err) {
      console.error("Error al cargar datos del dashboard:", err);
      // Si el error es de token, lo mandamos al login
      if ((err as any).response?.status === 401) {
        handleLogout();
      }
    }
  }, []);

  useEffect(() => {
    cargarDatosDashboard();
  }, [cargarDatosDashboard]);

  // --- Lógica de Acciones del Admin ---
  // (Adaptado de dashboard_admin.js)

  // Exportar PDF / Excel
  const handleExport = (tipo: 'pdf' | 'excel') => {
    // El JS original usa window.open, pero eso no enviará el token.
    // Usaremos el mismo método 'descargarReporte' que hicimos para ReportesPage.
    // Como esta lógica ya está en ReportesPage, aquí solo navegamos.
    // Si quisiéramos botones aquí, tendríamos que duplicar la lógica de descarga.
    // Por ahora, lo más limpio es navegar a la página de reportes.
    navigate('/reportes');
  };

  // Registrar Vigilante
  const handleRegistrarVigilante = async () => {
    const data = {
      nombre: nombreVigilante,
      doc_identidad: docVigilante,
      telefono: telefonoVigilante,
      id_rol: parseInt(rolVigilante, 10)
    };
    
    if (!data.nombre || !data.doc_identidad) {
      alert("Nombre y Documento son obligatorios.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/admin/registrar_vigilante`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("✅ Vigilante registrado correctamente");
      // Limpiar formulario
      setNombreVigilante('');
      setDocVigilante('');
      setTelefonoVigilante('');
    } catch (err) {
      console.error(err);
      alert("❌ Error al registrar vigilante");
    }
  };


  // --- JSX (Basado en dashboard_admin.html y la imagen) ---
  return (
    <div className={styles.dashboardContainer}>
      {/* Barra de navegación */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <img src="/img/SmartCar.png" alt="SmartCar Logo" className={styles.logo} />
        </div>
        <div className={styles.navRight}>
          {/* --- LINKS ACTUALIZADOS --- */}
          <Link to="/dashboard_admin" className={`${styles.navLink} ${styles.active}`}>🏠 Inicio</Link>
          <Link to="/personas" className={styles.navLink}>👥 Personas</Link>
          <Link to="/vehiculos" className={styles.navLink}>🚗 Vehículos</Link>
          <Link to="/reportes" className={styles.navLink}>📄 Reportes</Link>
          <Link to="/auditoria" className={styles.navLink}>🛡️ Auditoría</Link>
          
          <span className={styles.usuarioLogueado}>👤 {userInfo.nombre || 'Administrador'}</span>
          <button id="btnLogout" className={styles.btnLogout} onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className={styles.mainContent}>
        {/* Resumen General */}
        <section className={styles.tarjeta}>
          <h2>Resumen General</h2>
          <p>Total Vehículos: <span id="totalVehiculos">{resumen.total_vehiculos}</span></p>
          <p>Total Accesos: <span id_de_acceso="totalAccesos">{resumen.total_accesos}</span></p>
          <p>Total Alertas: <span id="totalAlertas">{resumen.total_alertas}</span></p>
        </section>

        {/* Registrar Vigilante */}
        <section className={styles.tarjeta}>
          <h2>Registrar Vigilante</h2>
          <input id="nombre" placeholder="Nombre completo" value={nombreVigilante} onChange={e => setNombreVigilante(e.target.value)} />
          <input id="doc" placeholder="Documento" value={docVigilante} onChange={e => setDocVigilante(e.target.value)} />
          <input id="telefono" placeholder="Teléfono" value={telefonoVigilante} onChange={e => setTelefonoVigilante(e.target.value)} />
          <select id="rol" value={rolVigilante} onChange={e => setRolVigilante(e.target.value)}>
            <option value="1">Principal</option>
            <option value="2">Nocturno</option>
          </select>
          <button id="btnRegistrar" onClick={handleRegistrarVigilante}>Registrar</button>
        </section>

        {/* Historial de Accesos */}
        <section className={`${styles.tarjeta} ${styles.tarjetaLarga}`}> {/* Podrías necesitar una clase extra para que ocupe más ancho */}
          <h2>Historial de Accesos</h2>
          {/*
            Los botones de exportar ahora van a la página de Reportes, 
            por lo que los quitamos de aquí para evitar confusión.
            La página /reportes ya tiene esta funcionalidad.
          */}
          <table id="tablaAccesos">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Tipo</th>
                <th>Color</th>
                <th>Propietario</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {accesos.length === 0 ? (
                <tr><td colSpan={5}>No hay accesos</td></tr>
              ) : (
                accesos.map((a, index) => (
                  <tr key={index}>
                    <td>{a.placa}</td>
                    <td>{a.tipo}</td>
                    <td>{a.color}</td>
                    <td>{a.propietario}</td>
                    <td>{a.resultado}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default DashboardAdminPage;