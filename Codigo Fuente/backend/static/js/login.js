document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const alertBox = document.getElementById("alert");

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

        setTimeout(() => {
          if (rol === "Administrador") {
            window.location.href = "dashboard_admin.html";
          } else {
            window.location.href = "dashboard_vigilante.html";
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
