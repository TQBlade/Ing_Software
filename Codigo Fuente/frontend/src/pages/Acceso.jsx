import { useState } from 'react';

// --- ICONOS SVG (Para no depender de librerías externas) ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

export default function Accesos() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Mock Data (Simulación de DB)
  const historial = [
    { id: 1, placa: 'XYZ-249', entrada: '06:30 AM', salida: '10:40 AM', fecha: '12/02/2025', estado: 'Permitido' },
    { id: 2, placa: 'XYZ-356', entrada: '08:40 AM', salida: '02:30 PM', fecha: '24/05/2025', estado: 'Denegado' },
    { id: 3, placa: 'OPL-587', entrada: '02:40 PM', salida: '06:00 PM', fecha: '30/04/2025', estado: 'Permitido' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      
      {/* --- HEADER Y BOTÓN PRINCIPAL --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-red-800">Historial de Accesos</h1>
          <p className="text-gray-600">Visualiza y gestiona el ingreso vehicular.</p>
        </div>
        {/* Botón para abrir el Modal de OCR */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-red-800 transition-all active:scale-95"
        >
          <CameraIcon />
          Validar Nuevo Acceso
        </button>
      </div>

      {/* --- BARRA DE FILTROS --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700 block mb-1">Buscar por placa</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Ej: ABC-123"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Desde</label>
          <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 outline-none" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Hasta</label>
          <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 outline-none" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
      </div>

      {/* --- TABLA DE DATOS --- */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Placa</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entrada</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Salida</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {historial.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.placa}</td>
                  <td className="px-6 py-4 text-gray-500">{item.entrada}</td>
                  <td className="px-6 py-4 text-gray-500">{item.salida}</td>
                  <td className="px-6 py-4 text-gray-500">{item.fecha}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.estado === 'Permitido' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Paginación simple */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50">
          <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">Anterior</button>
          <span className="text-sm text-gray-700">Página 1 de 10</span>
          <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm text-gray-700 hover:bg-gray-50">Siguiente</button>
        </div>
      </div>

      {/* --- MODAL (POPUP) PARA VALIDAR --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            {/* Header del Modal */}
            <div className="bg-red-700 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <CameraIcon /> Validar Acceso
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white hover:bg-red-600 rounded-full p-1 transition-colors">
                <XIcon />
              </button>
            </div>
            {/* Cuerpo del Modal */}
            <div className="p-6">
              <ValidationComponentInternal onClose={() => setShowModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- COMPONENTE INTERNO DEL MODAL (Lógica de OCR) ---
function ValidationComponentInternal({ onClose }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [accessType, setAccessType] = useState('entrada');

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleValidate = () => {
    setIsLoading(true);
    setTimeout(() => { // Simulación de API
      setIsLoading(false);
      setResult({ type: 'success', title: '¡ACCESO AUTORIZADO!', placa: 'ABC-123', propietario: 'Juan Pérez' });
    }, 2000);
  };

  return (
    <div className="space-y-5">
      {/* Botones Entrada/Salida */}
      <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-lg">
        <button onClick={() => setAccessType('entrada')} className={`py-2 text-sm font-bold rounded-md transition-all ${accessType === 'entrada' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>ENTRADA</button>
        <button onClick={() => setAccessType('salida')} className={`py-2 text-sm font-bold rounded-md transition-all ${accessType === 'salida' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>SALIDA</button>
      </div>

      {/* Área de Subida de Imagen */}
      <div className="relative group">
        {!previewUrl ? (
          <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-red-50 hover:border-red-300 transition-all">
            <div className="p-4 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
              <CameraIcon className="h-8 w-8 text-red-500" />
            </div>
            <span className="text-sm font-medium text-gray-600">Toca para subir foto</span>
            <span className="text-xs text-gray-400 mt-1">JPG, PNG</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
          </label>
        ) : (
          <div className="relative h-48 rounded-xl overflow-hidden shadow-md">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            <button onClick={() => { setPreviewUrl(null); setResult(null); }} className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Botón de Validar */}
      <button
        onClick={handleValidate}
        disabled={!previewUrl || isLoading}
        className={`w-full py-3.5 rounded-xl font-bold text-white flex justify-center items-center transition-all ${!previewUrl || isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-lg active:scale-95'}`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Procesando...
          </>
        ) : 'Validar Acceso Ahora'}
      </button>

      {/* Resultado */}
      {result && (
        <div className={`p-4 rounded-xl border-l-4 animate-fade-in ${result.type === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
          <h4 className={`font-extrabold ${result.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{result.title}</h4>
          <div className="mt-2 text-sm text-gray-700 space-y-1">
            <p>Placa: <span className="font-mono font-bold">{result.placa}</span></p>
            <p>Propietario: <span className="font-medium">{result.propietario}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}