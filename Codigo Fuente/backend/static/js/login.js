// static/js/login.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const alertBox = document.getElementById("alert");

  // Si el usuario ya tiene un token, intentamos mandarlo al dashboard
  const token = localStorage.getItem('jwt_token');
  if (token) {
    // Aquí podrías verificar el rol guardado y redirigir
    // Por ahora, lo mandamos al de vigilante como default
    window.location.href = "/dashboard_vigilante";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const clave = document.getElementById("clave").value.trim();
    const rol = document.querySelector('input[name="rol"]:checked')?.value;

    if (!rol) {
      showAlert("Debe seleccionar un rol.", "error");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, clave, rol }),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert("✅ Inicio de sesión exitoso", "success");

        // --- ¡LO MÁS IMPORTANTE! ---
        // Guardamos el token y los datos del usuario en el navegador
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('user_info', JSON.stringify(data.user));
        // -----------------------------

        setTimeout(() => {
          // Redirigimos según el rol con el que se logueó
          if (rol === "Administrador") {
            // window.location.href = "dashboard_admin.html"; // (Aún no lo creamos)
            alert("Dashboard de Admin aún no implementado.");
          } else {
            window.location.href = "/dashboard_vigilante"; // Redirige a la ruta de Flask
          }
        }, 1000);
      } else {
        showAlert("❌ " + (data.error || "Error de autenticación"), "error");
      }
    } catch (err) {
      console.error(err);
      showAlert("Error de conexión con el servidor.", "error");
    }
  });

  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.className = `alert ${type}`;
    alertBox.style.display = "block";
  }
});