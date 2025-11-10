document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("jwt_token");
  if (!token) return (window.location.href = "/");

  // Cerrar sesión
  document.getElementById("btnLogout").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/";
  });

  // Cargar resumen
  const resResumen = await fetch("/api/admin/resumen");
  const resumen = await resResumen.json();
  document.getElementById("totalVehiculos").textContent = resumen.total_vehiculos;
  document.getElementById("totalAccesos").textContent = resumen.total_accesos;
  document.getElementById("totalAlertas").textContent = resumen.total_alertas;

  // Cargar tabla
  const resAccesos = await fetch("/api/admin/accesos");
  const data = await resAccesos.json();
  const tbody = document.getElementById("tablaAccesos");
  data.forEach(a => {
          const row = `<tr>
        <td>${a.placa}</td>
        <td>${a.tipo}</td>
        <td>${a.color}</td>
        <td>${a.propietario}</td>
        <td>${a.resultado}</td>
      </tr>`;


    tbody.insertAdjacentHTML("beforeend", row);
  });

  // Exportar PDF / Excel
  document.getElementById("btnPDF").addEventListener("click", () => window.open("/api/admin/exportar/pdf"));
  document.getElementById("btnExcel").addEventListener("click", () => window.open("/api/admin/exportar/excel"));

  // Registrar vigilante
  document.getElementById("btnRegistrar").addEventListener("click", async () => {
    const data = {
      nombre: document.getElementById("nombre").value,
      doc_identidad: document.getElementById("doc").value,
      telefono: document.getElementById("telefono").value,
      id_rol: document.getElementById("rol").value
    };
    const res = await fetch("/api/admin/registrar_vigilante", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const r = await res.json();
    if (r.status === "ok") alert("✅ Vigilante registrado correctamente");
    else alert("❌ Error al registrar");
  });
});
