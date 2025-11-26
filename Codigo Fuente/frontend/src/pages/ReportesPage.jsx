import axios from 'axios';
import { useState } from 'react';

const API_EXCEL_URL = 'http://127.0.0.1:5000/api/admin/exportar/excel';
const API_PDF_URL = 'http://127.0.0.1:5000/api/admin/exportar/pdf';

const ReportesPage = () => {
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);
    
    // Fechas por defecto: Hoy
    const today = new Date().toISOString().split('T')[0];
    const [fechaInicio, setFechaInicio] = useState(today);
    const [fechaFin, setFechaFin] = useState(today);

    const handleDownload = async (tipo) => {
        const token = localStorage.getItem('token');
        if (!token) return alert("No autenticado");

        setLoading(tipo);
        setError(null);
        
        const urlBase = tipo === 'pdf' ? API_PDF_URL : API_EXCEL_URL;
        // Agregamos los parámetros a la URL
        const url = `${urlBase}?inicio=${fechaInicio}&fin=${fechaFin}`;
        const filename = tipo === 'pdf' ? 'Reporte_Gerencial.pdf' : 'Reporte_Gerencial.xlsx';

        try {
            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${token}` },
                responseType: 'blob',
            });
            const fileURL = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = fileURL;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            setError("Error al generar el reporte. Verifique el rango de fechas.");
            console.error(err);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="container-fluid p-4">
            <div className="mb-4 border-bottom pb-2">
                <h1 className="h2 text-gray-800 fw-bold">Informes Gerenciales</h1>
                <p className="text-muted">Generación de reportes detallados, estadísticas y auditoría.</p>
            </div>

            {/* FILTROS */}
            <div className="card shadow-sm mb-4 border-0 bg-white">
                <div className="card-body">
                    <h5 className="card-title fw-bold mb-3 text-primary">
                        <i className="fas fa-filter me-2"></i> Definir Periodo del Informe
                    </h5>
                    <div className="row g-3 align-items-end">
                        <div className="col-md-4">
                            <label className="form-label fw-bold">Fecha Inicio</label>
                            <input 
                                type="date" 
                                className="form-control" 
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold">Fecha Fin</label>
                            <input 
                                type="date" 
                                className="form-control" 
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTONES DE DESCARGA */}
            <div className="row g-4">
                {/* EXCEL */}
                <div className="col-md-6">
                    <div className="card h-100 shadow border-0 hover-shadow transition">
                        <div className="card-body text-center p-5">
                            <i className="fas fa-file-excel text-success" style={{fontSize: '4rem'}}></i>
                            <h3 className="mt-3 fw-bold">Informe Completo Excel</h3>
                            <p className="text-muted">
                                Incluye hojas separadas para: Estadísticas, Novedades, Incidentes Resueltos y Log de Accesos.
                            </p>
                            <button 
                                className="btn btn-success btn-lg w-100 fw-bold"
                                onClick={() => handleDownload('excel')}
                                disabled={loading === 'excel'}
                            >
                                {loading === 'excel' ? 'Generando...' : 'Descargar Excel'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* PDF */}
                <div className="col-md-6">
                    <div className="card h-100 shadow border-0 hover-shadow transition">
                        <div className="card-body text-center p-5">
                            <i className="fas fa-file-pdf text-danger" style={{fontSize: '4rem'}}></i>
                            <h3 className="mt-3 fw-bold">Resumen Ejecutivo PDF</h3>
                            <p className="text-muted">
                                Documento listo para imprimir con resumen de indicadores, hora pico y últimas novedades.
                            </p>
                            <button 
                                className="btn btn-danger btn-lg w-100 fw-bold"
                                onClick={() => handleDownload('pdf')}
                                disabled={loading === 'pdf'}
                            >
                                {loading === 'pdf' ? 'Generando...' : 'Descargar PDF'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className="alert alert-danger mt-4">{error}</div>}
        </div>
    );
};

export default ReportesPage;