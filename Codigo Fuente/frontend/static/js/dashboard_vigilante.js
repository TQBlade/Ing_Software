document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("jwt_token");
  const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");

  if (!token) {
    window.location.href = "/";
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:5000/api/usuario", {
      headers: { "Authorization": "Bearer " + token }
    });

    if (!response.ok) {
      console.warn("Token inválido o expirado, redirigiendo...");
      localStorage.clear();
      window.location.href = "/";
      return;
    }

    const data = await response.json();
    document.getElementById("nombreUsuario").textContent = data.user.usuario;

  } catch (error) {
    console.error("Error al validar sesión:", error);
    localStorage.clear();
    window.location.href = "/";
  }

  // Evitar que vuelva al login con el botón "Atrás"
  window.history.pushState(null, "", window.location.href);
  window.onpopstate = () => {
    window.history.pushState(null, "", window.location.href);
  };
});
