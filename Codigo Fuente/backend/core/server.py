import psycopg2
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

# ==========================================================
# 🚀 CONFIGURACIÓN INICIAL DEL SERVIDOR
# ==========================================================
app = Flask(__name__)

# Habilitar CORS para permitir peticiones desde React
CORS(app)

# Clave secreta para JWT
app.config["JWT_SECRET_KEY"] = "clave_super_segura_smartcar_2025"
jwt = JWTManager(app)

# ==========================================================
# 🔒 CONEXIÓN A LA BASE DE DATOS POSTGRESQL
# ==========================================================
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host="localhost",
            dbname="bd_carros",
            user="postgres",
            password="123456",
            port="5432"
        )
        return conn
    except Exception as e:
        print("❌ Error conectando a la base de datos:", e)
        return None


# ==========================================================
# 📡 RUTAS BÁSICAS DE PRUEBA
# ==========================================================
@app.route("/")
def index():
    return jsonify({"message": "🚗 PROMPT MAESTRO - SmartCar Server en ejecución correctamente."})


@app.route("/test-db")
def test_db():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"status": "error", "message": "No se pudo conectar a la base de datos."}), 500
    cur = conn.cursor()
    cur.execute("SELECT version();")
    version = cur.fetchone()
    cur.close()
    conn.close()
    return jsonify({"status": "ok", "db_version": version})


# ==========================================================
# 🧩 IMPORTAR RUTAS DE MÓDULOS (para futuros blueprints)
# ==========================================================
# from routes.auth_routes import auth_bp
# from routes.vehicle_routes import vehicle_bp
# app.register_blueprint(auth_bp, url_prefix="/auth")
# app.register_blueprint(vehicle_bp, url_prefix="/vehicles")


# ==========================================================
# 🚀 EJECUCIÓN DEL SERVIDOR
# ==========================================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"✅ Servidor Flask ejecutándose en http://127.0.0.1:{port}")
    app.run(host="127.0.0.1", port=port, debug=True)
