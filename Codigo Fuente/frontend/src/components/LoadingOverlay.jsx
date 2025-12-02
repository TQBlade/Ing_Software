
const LoadingOverlay = ({ isLoading, message = "Procesando..." }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
      <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center animate-bounce-in">
        {/* Spinner animado */}
        <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mb-3"></div>
        <p className="text-gray-700 font-semibold text-sm animate-pulse">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;