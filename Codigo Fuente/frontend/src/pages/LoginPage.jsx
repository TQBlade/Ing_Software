import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Simulación de AuthContext ---
// Idealmente, esto vendría de un `useAuth()` (Paquete A)
const useAuth = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user_info") || "null"));
  const [token, setToken] = useState(localStorage.getItem("jwt_token"));
  
  const login = async (usuario, clave, rol) => {
    const response = await fetch("http://127.0.0.1:5000/login", { // URL de tu login.js
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, clave, rol }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error de autenticación");
    }

    // Guardar en localStorage y estado
    localStorage.setItem("jwt_token", data.token);
    localStorage.setItem("user_info", JSON.stringify(data.user));
    setUser(data.user);
    setToken(data.token);
    return data.user; // Devuelve el usuario para la redirección
  };
  
  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
  };
  
  return { user, token, login, logout };
};
// --- Fin Simulación ---


export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [rol, setRol] = useState('Administrador'); // Valor por defecto
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const auth = useAuth();

  // 1. Si ya hay token, redirigir (lógica de tu login.js)
  useEffect(() => {
    if (auth.token && auth.user) {
      if (auth.user.rol === "Administrador") {
        navigate("/dashboard_admin");
      } else if (auth.user.rol === "Vigilante") {
        navigate("/dashboard_vigilante");
      }
    }
  }, [auth.token, auth.user, navigate]);

  // 2. Manejo del formulario (lógica de tu login.js)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rol) {
      setError("Debe seleccionar un rol.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const user = await auth.login(usuario, clave, rol);
      
      // Redirigir según el rol
      if (user.rol === "Administrador") {
        navigate("/dashboard_admin");
      } else {
        navigate("/dashboard_vigilante");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Traducción de login.css a Tailwind
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4" style={{ backgroundImage: "url('/img/fondo.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="login-container bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-xl w-full max-w-sm text-center">
        
        <div className="logo mb-4">
          {/* Asume que 'logo.png' está en 'frontend/public/img/' */}
          <img src="/img/logo.png" alt="SmartCar Logo" className="w-24 mx-auto" />
        </div>

        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Bienvenido a SmartCar</h1>
        <p className="text-gray-600 mb-6 text-sm">Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-5 text-left">
            <label className="block mb-2 text-sm font-medium text-gray-700">Usuario</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Ingresa tu usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-5 text-left">
            <label className="block mb-2 text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Ingresa tu contraseña"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              required
            />
          </div>

          <div className="roles flex justify-around mb-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="rol"
                value="Administrador"
                checked={rol === 'Administrador'}
                onChange={(e) => setRol(e.target.value)}
                className="text-red-700 focus:ring-red-500"
              />
              Administrador
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="rol"
                value="Vigilante"
                checked={rol === 'Vigilante'}
                onChange={(e) => setRol(e.target.value)}
                className="text-red-700 focus:ring-red-500"
              />
              Vigilante
            </label>
          </div>

          <button 
            type="submit" 
            className="w-full bg-red-800 text-white p-3 rounded-lg font-semibold text-base hover:bg-red-900 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
          
          {error && (
            <div className="alert-error mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}