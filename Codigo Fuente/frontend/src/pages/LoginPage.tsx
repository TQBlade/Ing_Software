import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Usaremos axios como en las otras páginas

// Importamos los estilos CSS Módulo
import styles from './LoginPage.module.css';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    // 1. Estados para manejar el formulario y los mensajes
    const [usuario, setUsuario] = useState('');
    const [clave, setClave] = useState('');
    const [rol, setRol] = useState('');
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ message: '', type: '', show: false });

    // 2. Lógica para verificar si ya existe un token (de login.js)
    useEffect(() => {
        // Renombramos 'jwt_token' a 'token' para ser consistentes
        const token = localStorage.getItem('token'); 
        const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');

        if (token && userInfo.rol) {
            // Si ya está logueado, lo redirigimos
            if (userInfo.rol === 'Administrador') {
                navigate('/dashboard_admin'); // Iremos al dashboard de admin en React
            } else if (userInfo.rol === 'Vigilante') {
                navigate('/dashboard_vigilante'); // Iremos al dashboard de vigilante en React
            }
        }
    }, [navigate]);

    // 3. Lógica del 'submit' del formulario (de login.js)
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setAlert({ message: '', type: '', show: false });

        if (!rol) {
            setAlert({ message: 'Debe seleccionar un rol.', type: 'error', show: true });
            setLoading(false);
            return;
        }

        try {
            // Llamamos a la API del backend (Flask)
            const response = await axios.post('http://127.0.0.1:5000/login', {
                usuario,
                clave,
                rol
            });

            // Éxito: (de login.js)
            setAlert({ message: '✅ Inicio de sesión exitoso', type: 'success', show: true });
            setLoading(false);

            // Guardamos el token y la info del usuario
            // Usamos 'token' para consistencia con las otras páginas
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user_info', JSON.stringify(response.data.user));

            // Redirigimos (usando React Router)
            setTimeout(() => {
                if (rol === 'Administrador') {
                    navigate('/dashboard_admin');
                } else {
                    navigate('/dashboard_vigilante');
                }
            }, 1000);

        } catch (err: any) {
            // Error: (de login.js)
            const errorMessage = err.response?.data?.error || 'Error de conexión con el servidor.';
            setAlert({ message: `❌ ${errorMessage}`, type: 'error', show: true });
            setLoading(false);
        }
    };

    // 4. Estructura JSX (basada en login.html)
    return (
        // Usamos los estilos importados
        <div className={styles.loginContainer}>
            <div className={styles.logo}>
                {/* Ruta actualizada para la carpeta /public */}
                <img src="/img/logo.png" alt="SmartCar Logo" />
            </div>

            <h1>Bienvenido a SmartCar</h1>
            <p>Inicia sesión para continuar</p>

            <form id="loginForm" onSubmit={handleLoginSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="usuario">Usuario</label>
                    <input
                        type="text"
                        id="usuario"
                        name="usuario"
                        placeholder="Ingresa tu usuario"
                        required
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="clave">Contraseña</label>
                    <input
                        type="password"
                        id="clave"
                        name="clave"
                        placeholder="Ingresa tu contraseña"
                        required
                        value={clave}
                        onChange={(e) => setClave(e.target.value)}
                    />
                </div>

                <div className={styles.roles}>
                    <label>
                        <input
                            type="radio"
                            name="rol"
                            value="Administrador"
                            checked={rol === 'Administrador'}
                            onChange={(e) => setRol(e.target.value)}
                        /> Administrador
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="rol"
                            value="Vigilante"
                            checked={rol === 'Vigilante'}
                            onChange={(e) => setRol(e.target.value)}
                        /> Vigilante
                    </label>
                </div>

                <button type="submit" id="btnLogin" disabled={loading}>
                    {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                </button>

                {/* Alerta de React (reemplaza <div id="alert">) */}
                <div 
                    className={`${styles.alert} ${styles[alert.type]} ${alert.show ? styles.show : ''}`}
                >
                    {alert.message}
                </div>
            </form>
        </div>
    );
};

export default LoginPage;