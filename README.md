# Sistema de Control de Acceso Vehicular - Universidad de Pamplona 🚗🔐

Repositorio académico correspondiente al proyecto de la asignatura **Ingeniería de Software II**, basado en la metodología de elicitación de requisitos propuesta por Durán y Bernárdez (2001).  
El sistema busca automatizar el control de ingreso de vehículos al campus universitario mediante lectura de placas o códigos QR, gestión de autorizaciones, trazabilidad y reportes.

---

## 📑 Tabla de Contenidos

- Descripción del Proyecto  
- Integrantes  
- Estructura del Proyecto  
- Tecnologías Utilizadas  
- Características y Funcionalidades  
- Prototipo PHP  
- Documentación del Proyecto  
- Proyecto Desarrollado  
- Licencia  
- Autor y Docente  

---

## 📌 Descripción del Proyecto

Este sistema tiene como propósito garantizar el control seguro, eficiente y automatizado del ingreso vehicular a los parqueaderos de la universidad. Implementa validación por lectura de placa, trazabilidad de accesos, control de horarios y generación de alertas, apoyando al personal de vigilancia y administración.

---

## 👥 Integrantes

| Nombre            | Rol                     |
|-------------------|--------------------------|
| Asly Acuña        | Analista / Desarrollador |
| Owen Fuentes      | Analista / Desarrollador |
| Erick Usuche      | Analista / Desarrollador |
| Felipe Mantilla   | Analista / Desarrollador |

---

## 📁 Estructura del Proyecto

```plaintext
acceso-vehicular-unipamplona/
├── Documentos/
│   ├── Tarea 1 - Modelo Estático.docx
│   ├── Tarea 2 - Modelo de Comportamiento.docx
│   ├── Tarea 3 - Prototipo.docx
│   ├── Tarea 4 - Requisitos de Información.docx
│   ├── Tarea 5 - Requisitos Funcionales.docx
│   └── Tarea 6 - Requisitos No Funcionales.docx
│
├── prototipo_php/
│   ├── index.php
│   ├── dashboard.php
│   ├── registrar_vehiculo.php
│   ├── validar_acceso.php
│   └── style.css
│
├── versionado.md           # Hoja de versiones del proyecto
├── Contribuciones.md       # Guía para contribuir al proyecto
├── LICENSE                 # Licencia MIT
└── README.md               # Documentación general del proyecto
```

---

## 🛠️ Tecnologías Utilizadas

- **PHP 7.4**: Desarrollo del prototipo funcional.  
- **HTML5 y CSS3**: Interfaces básicas.  
- **Git + GitHub**: Control de versiones y documentación.  

---

## ⚙️ Características y Funcionalidades

- Registro de usuarios y vehículos autorizados.  
- Validación de acceso vehicular por placa o QR.  
- Control de horarios y permisos especiales.  
- Registro de accesos (entrada/salida).  
- Generación de alertas por accesos no autorizados.  
- Panel administrativo para reportes y trazabilidad.  
- Registro de cambios y auditoría del sistema.  

---

## 🧪 Prototipo PHP

El prototipo básico simula el flujo funcional del sistema real, incluyendo:

- Inicio de sesión simulado  
- Registro de vehículo  
- Validación de acceso por placa (simulado)  
- Alertas de acceso denegado  
- Panel de navegación por tipo de usuario  

🗂️ Archivos disponibles en la carpeta [`prototipo_php/`]

---

## 📄 Documentación del Proyecto

Los documentos Word correspondientes a cada tarea se encuentran organizados por nombre en la carpeta `Documentos/`. Cada uno incluye lo solicitado en la metodología de análisis de requisitos basada en prototipos.

---

## 📦 Proyecto Desarrollado – PROMPT MAESTRO 🚗🤖

### 🎯 Objetivo General
Desarrollar un **Sistema Inteligente de Control de Acceso Vehicular** para la **Universidad de Pamplona – Sede Villa del Rosario**, implementado con un **backend en Python nativo (sin frameworks)**, un **frontend en React + TailwindCSS**, **base de datos PostgreSQL** y **reconocimiento automático de placas** mediante **OpenCV + EasyOCR**.

---

### 🏗️ Arquitectura Tecnológica

| Componente | Tecnología / Herramienta |
|-------------|---------------------------|
| **Backend** | Python 3.10+ (`socketserver`, `http.server`) |
| **Frontend** | React.js 18+ |
| **Estilos** | TailwindCSS |
| **Base de Datos** | PostgreSQL |
| **Conexión BD** | psycopg2 (pool de conexiones) |
| **OCR** | OpenCV + EasyOCR |
| **Seguridad** | pyjwt (JWT) + hashlib (SHA256) |
| **Despliegue Planeado** | Docker + Nginx (proxy inverso, estáticos) + HTTPS (Let's Encrypt) |

---

### 📂 Estructura del Proyecto Desarrollado

```plaintext
proyecto-desarrollado/
├── backend/
│   ├── core/
│   │   ├── server.py
│   │   ├── router.py
│   │   ├── controller_personas.py
│   │   ├── controller_vehiculos.py
│   │   ├── controller_accesos.py
│   │   ├── controller_alertas.py
│   │   ├── auth.py
│   │   └── db.py
│   ├── models/
│   │   ├── vehiculo.py
│   │   └── ...
│   ├── ocr/
│   │   └── detector.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   └── App.jsx
│   └── package.json
├── docker-compose.yml
└── .env
```

---

### 🔗 Endpoints de la API (Ejemplos)

| Método | Endpoint | Descripción | Requiere Auth |
|---------|-----------|-------------|----------------|
| `POST` | `/api/login` | Iniciar sesión y obtener token JWT | ❌ |
| `POST` | `/api/accesos/validar` | Validar acceso por imagen base64 (OCR) | ✅ |
| `GET`  | `/api/vehiculos` | Listar vehículos registrados | ✅ |
| `POST` | `/api/vehiculos` | Registrar nuevo vehículo | ✅ |
| `GET`  | `/api/alertas` | Listar alertas de seguridad | ✅ |

---

### 💡 Características Adicionales

- Backend nativo sin frameworks (mayor control del flujo HTTP).  
- Reconocimiento OCR mediante EasyOCR + OpenCV.  
- Seguridad mediante JWT + SHA256.  
- Pool de conexiones PostgreSQL optimizado con `psycopg2`.  
- Interfaz moderna en React con TailwindCSS.  
- Docker Compose para orquestación del backend y la base de datos.  
- Despliegue escalable con Nginx y certificados HTTPS.  

---

## 👨‍🏫 Autor y Docente

Proyecto desarrollado para la asignatura **Ingeniería de Software II**  
**Docente:** *Ing. Fanny Casadiego*
