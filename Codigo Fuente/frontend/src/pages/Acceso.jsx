import { useState } from "react";

/* ===========================================================
   🎯 ICONOS SVG (Sin dependencias externas)
   =========================================================== */
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/* ===========================================================
   🚗 COMPONENTE PRINCIPAL: HISTORIAL DE ACCESOS
   =========================================================== */
export default function Accesos() {
  // Estados principales
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Datos simulados (ejemplo temporal hasta conectar con backend)
  const historialMock = [
    { id: 1, placa: "XYZ-249", entrada: "6:30 am", salida: "10:40 am", fecha: "12/02/2025", estado: "Permitido" },
    { id: 2, placa: "XYZ-356", entrada: "8:40 am", salida: "2:30 pm", fecha: "24/05/2025", estado: "Denegado" },
    { id: 3, placa: "OPL-587", entrada: "2:40 pm", salida: "6:00 pm", fecha: "30/04/2025", estado: "Permitido" },
    { id: 4, placa: "AWZ-890", entrada: "4:10 pm", salida: "6:30 pm", fecha: "23/09/2025", estado: "Permitido" },
    { id: 5, placa: "BGT-123", entrada: "10:00 am", salida: "-", fecha: "19/09/2025", estado: "Permitido" },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-full">
      {/* ===========================================================
         🧱 ENCABEZADO
         =========================================================== */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-red-800">Historial de Accesos</h1>
          <p className="text-gray-600 text-sm">Visualiza y gestiona el ingreso vehicular.</p>
        </div>

        {/* Botón principal (abrir OCR) */}
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 md:mt-0 flex items-center bg-red-700 text-white px-6 py-3 rounded-lg shadow hover:bg-red-800 transition-colors font-semibold"
        >
          <CameraIcon />
          <span className="ml-2">Validar Nuevo Acceso</span>
        </button>
      </div>

      {/* ===========================================================
         🔍 FILTROS DE BÚSQUEDA
         =========================================================== */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Buscador por placa */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por placa</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 sm:text-sm"
              placeholder="Ej: ABC-123"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filtros de fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
          <input
            type="date"
            className="block w-full border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 sm:text-sm py-2 px-3"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
          <input
            type="date"
            className="block w-full border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 sm:text-sm py-2 px-3"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {/* ===========================================================
         📋 TABLA DE HISTORIAL
         =========================================================== */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Placa", "Hora Entrada", "Hora Salida", "Fecha", "Estado"].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historialMock.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.placa}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.entrada}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.salida}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.fecha}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.estado === "Permitido"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===========================================================
           📄 PAGINACIÓN (estática por ahora)
           =========================================================== */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">1</span> a <span className="font-medium">5</span> de{" "}
            <span className="font-medium">50</span> resultados
          </p>
          <div className="hidden sm:flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100">
              Anterior
            </button>
            <span className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700">
              1 / 10
            </span>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100">
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* ===========================================================
         🎥 MODAL VALIDACIÓN OCR
         =========================================================== */}
      {showModal && <ModalValidacion onClose={() => setShowModal(false)} />}
    </div>
  );
}

/* ===========================================================
   🧠 COMPONENTE INTERNO: MODAL DE VALIDACIÓN OCR
   =========================================================== */
function ModalValidacion({ onClose }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [accessType, setAccessType] = useState("entrada");

  // --- Manejo de archivo ---
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setResult(null);
    setPreviewUrl(URL.createObjectURL(selectedFile));

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = () => setBase64Image(reader.result);
  };

  // --- Simulación del proceso OCR ---
  const handleValidation = async () => {
    if (!base64Image) return alert("Selecciona una imagen.");
    setIsLoading(true);
    setResult(null);

    setTimeout(() => {
      setIsLoading(false);
      const mockSuccess = Math.random() > 0.3;
      setResult(
        mockSuccess
          ? { type: "success", title: "¡AUTORIZADO!", details: { placa: "ABC-123", propietario: "Juan Pérez" } }
          : { type: "error", title: "DENEGADO", details: { placa: "XYZ-999", motivo: "No registrado" } }
      );
    }, 2000);
  };

  /* ===========================================================
     🧩 RENDER MODAL
     =========================================================== */
  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen text-center sm:block sm:p-0">
        {/* Fondo oscuro */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        {/* Contenido del modal */}
        <div className="inline-block align-bottom bg-white rounded-xl text-left shadow-xl transform transition-all sm:max-w-lg sm:w-full relative p-6">
          {/* Cerrar */}
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
            <XIcon />
          </button>

          <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center">
            <CameraIcon />
            <span className="ml-2">Validar Acceso Vehicular</span>
          </h3>

          {/* Tipo de acceso */}
          <div className="flex space-x-4 justify-center mb-4">
            {["entrada", "salida"].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setAccessType(tipo)}
                className={`px-4 py-2 rounded-full font-bold text-sm ${
                  accessType === tipo
                    ? "bg-blue-100 text-blue-700 border-2 border-blue-500"
                    : "bg-gray-100 text-gray-500 border-2 border-transparent"
                }`}
              >
                {tipo.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Subida de imagen */}
          {!previewUrl ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => document.getElementById("file-upload").click()}
            >
              <CameraIcon className="h-10 w-10 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">Toca para subir foto de placa</span>
              <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="relative">
              <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
              <button
                onClick={() => {
                  setPreviewUrl(null);
                  setFile(null);
                  setResult(null);
                }}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
              >
                <XIcon />
              </button>
            </div>
          )}

          {/* Botón Validar */}
          <button
            onClick={handleValidation}
            disabled={isLoading || !file}
            className={`w-full py-3 rounded-xl font-bold text-white mt-4 transition-all ${
              isLoading || !file ? "bg-gray-400" : "bg-red-600 hover:bg-red-700 shadow-md"
            }`}
          >
            {isLoading ? "Procesando..." : "Validar Ahora"}
          </button>

          {/* Resultado */}
          {result && (
            <div
              className={`p-4 rounded-xl border-l-4 mt-4 ${
                result.type === "success"
                  ? "bg-green-50 border-green-500 text-green-800"
                  : "bg-red-50 border-red-500 text-red-800"
              } animate-fade-in-up`}
            >
              <h4 className="font-extrabold">{result.title}</h4>
              <p className="text-sm mt-1">
                Placa: <strong>{result.details.placa}</strong>
              </p>
              {result.details.propietario && <p className="text-sm">Prop: {result.details.propietario}</p>}
              {result.details.motivo && <p className="text-sm">Motivo: {result.details.motivo}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
