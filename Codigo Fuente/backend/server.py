from flask import Flask, render_template
from flask_cors import CORS
from core.routes.login_routes import login_bp
#from routes.personas_routes import personas_bp
#from routes.vehiculos_routes import vehiculos_bp  
import os

# ==========================================================
# 🚀 CONFIGURACIÓN DEL SERVIDOR FLASK
# ==========================================================

# Directorio actual del archivo server.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Crear la app Flask especificando carpetas
app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static")
)

CORS(app)  # Permitir peticiones desde el frontend (HTML/JS)

# Registrar el Blueprint (rutas del login)
app.register_blueprint(login_bp)
# Registrar el Blueprint (rutas de personas)
#app.register_blueprint(personas_bp)
# Registrar el Blueprint (rutas de vehículos)
#app.register_blueprint(vehiculos_bp)



# ==========================================================
# 🔧 RUTA BASE (Página de Login)
# ==========================================================
@app.route("/")
def mostrar_login():
    print(f"📂 Buscando plantilla en: {app.template_folder}")
    return render_template("login.html")

# ==========================================================
# 🔧 RUTA DE PRUEBA API
# ==========================================================
@app.route("/api/status")
def status():
    return {
        "status": "ok",
        "message": "🚗 Servidor SmartCar Flask funcionando correctamente."
    }

# ==========================================================
# 🏁 EJECUCIÓN
# ==========================================================
if __name__ == "__main__":
    print("✅ Servidor Flask ejecutándose en: http://127.0.0.1:5000")
    print(f"📂 Plantillas desde: {app.template_folder}")
    print(f"📦 Archivos estáticos desde: {app.static_folder}")
    app.run(host="127.0.0.1", port=5000, debug=True)
