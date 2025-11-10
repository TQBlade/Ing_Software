import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'; // 👈 1. Importa esto
import App from './App.tsx'
import './index.css'; // Aquí están tus estilos de Tailwind

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> {/* 👈 2. Envuelve tu <App> con esto */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)