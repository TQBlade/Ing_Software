import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './DashboardVigilantePage.module.css'; // Importamos los estilos

// Definimos la URL de la API (como en las otras páginas)
const API_URL = 'http://127.0.0.1:5000/api';

// --- Definición de tipos para los datos ---
interface IAcceso {
  fecha_hora: string;
  placa: string;
  resultado: string;
  vigilante: string;
}

interface IUserInfo {
  nombre?: string;
  rol?: string;
}

const DashboardVigilantePage: React.FC = () => {
  const navigate = useNavigate();

  // --- Estados de React para manejar los datos ---
  const [userInfo, setUserInfo] = useState<IUserInfo>({});
  const [ultimosAccesos, setUltimosAccesos] = useState<IAcceso[]>([]);
  const [totalVehiculos, setTotalVehiculos] = useState(0);
  const [alertasActivas, setAlertasActivas] = useState(0);
  const [placaInput, setPlacaInput] = useState('');
  
  // --- Lógica de Autenticación y Cierre de Sesión ---
  // (Lógica adaptada de dashboard_vigilante.js)

  useEffect(() => {
    // CAMBIO: Usamos 'token' para ser consistentes con LoginPage.tsx
    const token = localStorage.getItem("token"); 
    const storedUserInfo = JSON.parse(localStorage.getItem("user_info") || "{}");

    if (!token) {
      navigate("/login"); // Si no hay token, regresamos al login de React
      return;
    }
    setUserInfo(storedUserInfo);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_info");
    navigate("/login");
  };

  // --- Lógica de Carga de Datos ---
  // (Funciones adaptadas de dashboard_vigilante.js)

  const cargarUltimosAccesos = useCallback(async () => {
    try {
      // Usamos axios con la URL completa
      const res = await axios.get(`${API_URL}/ultimos_accesos`);
      setUltimosAccesos(res.data);
    } catch (err) {
      console.error("❌ Error al cargar accesos:", err);
    }
  }, []);

  const cargarTotalVehiculos = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/total_vehiculos`);
      setTotalVehiculos(res.data.total);
    } catch (err) {
      console.error("❌ Error al cargar total de vehículos:", err);
    }
  }, []);

  const cargarAlertasActivas = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/alertas_activas`);
      setAlertasActivas(res.data.total);
    } catch (err) {
      console.error("❌ Error al cargar alertas activas:", err);
    }
  }, []);

  // Efecto para cargar todos los datos cuando el componente se monta
  useEffect(() => {
    cargarUltimosAccesos();
    cargarTotalVehiculos();
    cargarAlertasActivas();
  }, [cargarUltimosAccesos, cargarTotalVehiculos, cargarAlertasActivas]);

  // --- Lógica de Búsqueda de Placa ---
  // (Lógica adaptada de dashboard_vigilante.js)
  
  const handleBuscarPlaca = async () => {
    if (!placaInput) {
      alert("Por favor ingresa una placa.");
      return;
    }
    try {
      // Nota: El JS original usaba fetch('/api/...')
      // pero las APIs en server.py suelen tener /api/. 
      // Ajusta si tu ruta es diferente.
      const res = await axios.get(`${API_URL}/buscar_placa/${placaInput}`);
      const data = res.data;
      
      alert(
        `✅ Vehículo encontrado:\nPlaca: ${data.placa}\nTipo: ${data.tipo}\nColor: ${data.color}\nPropietario: ${data.propietario}`
      );
    } catch (err) {
      console.error("Error al buscar placa:", err);
      alert("❌ Placa no encontrada o error de conexión");
    }
  };


  // --- JSX (Basado en dashboard_vigilante.html) ---
  return (
    <div className={styles.dashboardContainer}>
      {/* Barra de navegación */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <img src="/img/SmartCar.png" alt="SmartCar Logo" className={styles.logo} />
        </div>
        <div className={styles.navRight}>
          <Link to="/dashboard_vigilante" className={`${styles.navLink} ${styles.active}`}>🏠 Inicio</Link>
          <Link to="/accesos" className={styles.navLink}>📝 Historial</Link>
          <Link to="/alertas" className={styles.navLink}>🚨 Alertas</Link>
          <Link to="/vehiculos" className={styles.navLink}>⚙️ Gestión</Link>
          <Link to="/calendario" className={styles.navLink}>📅 Calendario</Link>
          <span className={styles.usuarioLogueado}>👤 <span id="nombreUsuario">{userInfo.nombre || 'Cargando...'}</span></span>
          <button id="btnLogout" className={styles.btnLogout} onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className={styles.mainContent}>
        {/* Validar acceso */}
        <section className={`${styles.tarjeta} ${styles.rojo}`}>
          <h2>Validar acceso vehicular</h2>
          <input 
            type="text" 
            id="buscarPlaca" 
            placeholder="Buscar placa..." 
            value={placaInput}
            onChange={(e) => setPlacaInput(e.target.value)}
          />
          <button id="btnBuscar" onClick={handleBuscarPlaca}>Verificar</button>
        </section>

        {/* Historial */}
        <section className={styles.tarjeta}>
          <h2>Historial de Accesos</h2>
          <table id="tablaAccesos">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Placa</th>
                <th>Resultado</th>
                <th>Vigilante</th>
              </tr>
            </thead>
            <tbody>
              {ultimosAccesos.length === 0 ? (
                <tr><td colSpan={4}>No hay registros</td></tr>
              ) : (
                ultimosAccesos.map((a, index) => (
                  <tr key={index}>
                    <td>{a.fecha_hora}</td>
                    <td>{a.placa}</td>
                    <td>{a.resultado}</td>
                    <td>{a.vigilante}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* Alertas */}
        <section className={`${styles.tarjeta} ${styles.alerta}`}>
          <h2>Alertas Activas</h2>
          <p id="alertasActivas">{alertasActivas} alertas activas</p>
          <Link to="/alertas" className={styles.navLink}><button>Gestionar alertas</button></Link>
        </section>

        {/* Gestión */}
        <section className={styles.tarjeta}>
          <h2>Gestión de Vehículos</h2>
          <p>Total registrados: <span id="totalVehiculos">{totalVehiculos}</span></p>
          <Link to="/vehiculos" className={styles.navLink}><button>Ver Vehículos</button></Link>
        </section>
      </main>
    </div>
  );
};

export default DashboardVigilantePage;