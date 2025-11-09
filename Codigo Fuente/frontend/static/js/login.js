// static/js/login.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const alertBox = document.getElementById("alert");

  // --- 1️⃣ Si ya hay token, redirigir según el rol ---
  const token = localStorage.getItem("jwt_token");
  const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");

  if (token && userInfo.rol) {
    if (userInfo.rol === "Administrador") {
      window.location.href = "/dashboard_admin";
    } else if (userInfo.rol === "Vigilante") {
      window.location.href = "/dashboard_vigilante";
    }
    return;
  }

  // --- 2️⃣ Manejo del formulario ---
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

        // Guardar token y usuario
        localStorage.setItem("jwt_token", data.token);
        localStorage.setItem("user_info", JSON.stringify(data.user));

        // Redirigir según el rol
        setTimeout(() => {
          if (rol === "Administrador") {
            window.location.href = "/dashboard_admin";
          } else {
            window.location.href = "/dashboard_vigilante";
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

  // --- 3️⃣ Función de alerta ---
  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.className = `alert ${type}`;
    alertBox.style.display = "block";
  }
});
