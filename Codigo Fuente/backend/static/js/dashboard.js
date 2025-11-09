// static/js/dashboard.js

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. PROTECCIÓN DE RUTA (CLIENT-SIDE) ---
    const token = localStorage.getItem('jwt_token');
    const userInfo = JSON.parse(localStorage.getItem('user_info'));

    if (!token || !userInfo) {
        // Si no hay token o info de usuario, ¡fuera!
        window.location.href = "/"; // Redirige a login.html
        return;
    }

    // --- 2. PERSONALIZAR LA PÁGINA ---
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
        // Usamos el rol con el que se logueó y su nombre
        welcomeMessage.textContent = `Bienvenido, ${userInfo.rol_login} ${userInfo.nombre}`;
    }

    // --- 3. FUNCIONALIDAD DE LOGOUT ---
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Borramos el token y la info
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_info');
            
            // Redirigimos al login
            window.location.href = "/";
        });
    }

    // --- 4. PRÓXIMO PASO: CARGAR DATOS (Alertas, Historial, etc.) ---
    // Aquí es donde harías las llamadas fetch() a tu API
    // para obtener las alertas, el historial, etc.
    // fetchAlerts(token);
    // fetchHistory(token);
});

// Ejemplo de cómo harías una llamada a una API protegida
async function fetchAlerts(token) {
    /*
    try {
        const response = await fetch("http://127.0.0.1:5000/api/alertas", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                // ¡Enviamos el token para autenticarnos!
                "Authorization": `Bearer ${token}` 
            }
        });

        if (response.status === 401) { // Token expirado o inválido
             window.location.href = "/"; // Forzar logout
             return;
        }

        const data = await response.json();
        
        // ... (Aquí actualizas el widget de alertas con 'data')

    } catch (err) {
        console.error("Error al cargar alertas:", err);
    }
    */
}