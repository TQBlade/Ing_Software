document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("jwt_token");
  const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");

  // 🚨 Si no hay token, regresar al login
  if (!token) {
    window.location.href = "/";
    return;
  }

  // ✅ Mostrar nombre del vigilante logueado
  document.getElementById("nombreUsuario").textContent =
    userInfo.nombre || "Vigilante";

  // ✅ Botón de cerrar sesión
  document.getElementById("btnLogout").addEventListener("click", () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_info");
    window.location.href = "/";
  });

  // ✅ Evitar que con “atrás” vuelva al login
  window.history.pushState(null, "", window.location.href);
  window.onpopstate = () => {
    window.history.pushState(null, "", window.location.href);
  };

  // -------------------------------
  // 🔹 Cargar los datos del dashboard
  // -------------------------------
  await cargarUltimosAccesos();
  await cargarTotalVehiculos();
  await cargarAlertasActivas();

  // -------------------------------
  // 🔹 Buscar vehículo por placa
  // -------------------------------
  const btnBuscar = document.getElementById("btnBuscar");
  const inputPlaca = document.getElementById("buscarPlaca");

  btnBuscar.addEventListener("click", async () => {
    const placa = inputPlaca.value.trim();
    if (!placa) {
      alert("Por favor ingresa una placa.");
      return;
    }

    try {
      const res = await fetch(`/api/buscar_placa/${placa}`);
      const data = await res.json();

      if (!res.ok) {
        alert("❌ Placa no encontrada");
        return;
      }

      alert(
        `✅ Vehículo encontrado:
Placa: ${data.placa}
Tipo: ${data.tipo}
Color: ${data.color}
Propietario: ${data.propietario}`
      );
    } catch (err) {
      console.error("Error al buscar placa:", err);
      alert("Error de conexión con el servidor");
    }
  });
});

// ---------------------------------------------
// 🔸 Función: Cargar los últimos accesos (7)
// ---------------------------------------------
async function cargarUltimosAccesos() {
  try {
    const res = await fetch("/api/ultimos_accesos");
    const accesos = await res.json();

    const tbody = document.querySelector("#tablaAccesos tbody");
    tbody.innerHTML = "";

    if (accesos.length === 0) {
      tbody.innerHTML = "<tr><td colspan='4'>No hay registros</td></tr>";
      return;
    }

    accesos.forEach((a) => {
      const fila = `
        <tr>
          <td>${a.fecha_hora}</td>
          <td>${a.placa}</td>
          <td>${a.resultado}</td>
          <td>${a.vigilante}</td>
        </tr>`;
      tbody.insertAdjacentHTML("beforeend", fila);
    });
  } catch (err) {
    console.error("❌ Error al cargar accesos:", err);
  }
}

// ---------------------------------------------
// 🔸 Función: Total de vehículos
// ---------------------------------------------
async function cargarTotalVehiculos() {
  try {
    const res = await fetch("/api/total_vehiculos");
    const data = await res.json();
    document.getElementById("totalVehiculos").textContent = data.total;
  } catch (err) {
    console.error("❌ Error al cargar total de vehículos:", err);
  }
}

// ---------------------------------------------
// 🔸 Función: Alertas activas
// ---------------------------------------------
async function cargarAlertasActivas() {
  try {
    const res = await fetch("/api/alertas_activas");
    const data = await res.json();
    document.getElementById(
      "alertasActivas"
    ).textContent = `${data.total} alertas activas`;
  } catch (err) {
    console.error("❌ Error al cargar alertas activas:", err);
  }
}
