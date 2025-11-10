# ===========================================================
#  SmartCar - Servidor Principal con Seguridad JWT
# ===========================================================
import sys
from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS
from datetime import datetime, timedelta
import jwt
import os
from functools import wraps
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

# Importar funciones de conexión y modelo de usuario
from backend.core.db.connection import get_connection
from backend.models.user_model import verificar_usuario

# RUTAS CORRECTAS PARA FRONTEND
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
TEMPLATE_DIR = os.path.join(BASE_DIR, "frontend", "templates")
STATIC_DIR = os.path.join(BASE_DIR, "frontend", "static")

app = Flask(__name__, template_folder=TEMPLATE_DIR, static_folder=STATIC_DIR)
CORS(app)


# ===========================================================
# CONFIGURACIÓN INICIAL
# ===========================================================


# 🔒 Clave secreta para JWT
app.config["SECRET_KEY"] = "SmartCar_SeguridadUltra_2025"

# ===========================================================
# DECORADOR: VALIDAR TOKEN JWT
# ===========================================================
def token_requerido(f):
    @wraps(f)
    def decorador(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"error": "Token no proporcionado"}), 401

        try:
            token = token.replace("Bearer ", "")
            datos = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            request.usuario_actual = datos
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expirado"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token inválido"}), 401

        return f(*args, **kwargs)
    return decorador


# ===========================================================
# RUTAS PÚBLICAS
# ===========================================================
@app.route("/")
def index():
    """Página principal: formulario de login"""
    return render_template("login.html")

# ===========================================================
# RUTA DE LOGIN
# ===========================================================
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        usuario = data.get("usuario")
        clave = data.get("clave")
        rol = data.get("rol")

        if not usuario or not clave or not rol:
            return jsonify({"error": "Faltan campos requeridos"}), 400

        # Verificar usuario en la base
        user = verificar_usuario(usuario, clave, rol)
        if not user:
            return jsonify({"error": "Usuario, clave o rol incorrectos"}), 401

        # Crear token válido por 2 horas
        token = jwt.encode({
            "usuario": user["usuario"],
            "rol": user["rol"],
            "exp": datetime.utcnow() + timedelta(hours=2)
        }, app.config["SECRET_KEY"], algorithm="HS256")

        print(f"✅ Login exitoso: {user['usuario']} ({user['rol']})")

        return jsonify({
            "status": "ok",
            "token": token,
            "user": {
                "nombre": user["nombre"],
                "usuario": user["usuario"],
                "rol": user["rol"]
            }
        }), 200

    except Exception as e:
        print("❌ Error en login:", e)
        return jsonify({"error": "Error interno del servidor"}), 500

# ===========================================================
# RUTAS PROTEGIDAS
# ===========================================================
# ================================================
# DASHBOARD VIGILANTE 
# ================================================
@app.route("/dashboard_vigilante")
def dashboard_vigilante():
    return render_template("dashboard_vigilante.html")

from backend.models.dashboard_model import (
    obtener_ultimos_accesos,
    contar_total_vehiculos,
    contar_alertas_activas,
    buscar_placa_bd
)

@app.route("/api/ultimos_accesos", methods=["GET"])
def api_ultimos_accesos():
    data = obtener_ultimos_accesos()
    return jsonify(data)

@app.route("/api/total_vehiculos", methods=["GET"])
def api_total_vehiculos():
    data = contar_total_vehiculos()
    return jsonify(data)

@app.route("/api/alertas_activas", methods=["GET"])
def api_alertas_activas():
    data = contar_alertas_activas()
    return jsonify(data)

@app.route("/api/buscar_placa/<placa>", methods=["GET"])
def api_buscar_placa(placa):
    data = buscar_placa_bd(placa)
    if data:
        return jsonify(data)
    else:
        return jsonify({"error": "Placa no encontrada"}), 404
# ================================================
# DASHBOARD ADMINISTRADOR

@app.route("/dashboard_admin")
@token_requerido
def dashboard_admin():
    """Página del dashboard para administradores"""
    datos = request.usuario_actual
    if datos["rol"] != "Administrador":
        return jsonify({"error": "Acceso restringido a administradores"}), 403
    return render_template("dashboard_admin.html", usuario=datos["usuario"])


@app.route("/api/usuario", methods=["GET"])
@token_requerido
def obtener_usuario():
    """Devuelve datos del usuario autenticado"""
    datos = request.usuario_actual
    return jsonify({
        "status": "ok",
        "user": datos
    }), 200


@app.route("/api/dashboard_vigilante", methods=["GET"])
@token_requerido
def get_dashboard_data():
    try:
        conn = get_connection()
        cur = conn.cursor()

        # --- Historial de accesos ---
        cur.execute("""
            SELECT TO_CHAR(fecha_hora, 'HH24:MI'),
                   vehiculo.placa,
                   CASE WHEN LOWER(resultado) LIKE '%concedido%' THEN 'Verde' ELSE 'Rojo' END AS estado
            FROM acceso
            JOIN vehiculo ON acceso.id_vehiculo = vehiculo.id_vehiculo
            ORDER BY fecha_hora DESC LIMIT 5;
        """)
        historial = cur.fetchall()

        # --- Alertas activas ---
        cur.execute("SELECT COUNT(*) FROM alerta;")
        alertas = cur.fetchone()[0]

        # --- Gestión de vehículos ---
        cur.execute("SELECT COUNT(*) FROM vehiculo;")
        total_vehiculos = cur.fetchone()[0]

        cur.close()
        conn.close()

        return jsonify({
            "historial": historial,
            "alertas": alertas,
            "vehiculos": total_vehiculos
        })

    except Exception as e:
        print("❌ Error cargando datos dashboard:", e)
        return jsonify({"error": "Error al cargar datos"}), 500

# ===========================================================
# RUTA PARA ARCHIVOS ESTÁTICOS
# ===========================================================
@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory(app.static_folder, filename)

# ===========================================================
# TEST DE CONEXIÓN A BD
# ===========================================================
@app.route("/test_db")
def test_db():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT NOW();")
        result = cur.fetchone()
        cur.close()
        conn.close()
        return jsonify({"estado": "ok", "hora_bd": str(result[0])})
    except Exception as e:
        return jsonify({"estado": "error", "detalle": str(e)}), 500

# ===========================================================
# INICIO DEL SERVIDOR
# ===========================================================
if __name__ == "__main__":
    print("✅ Servidor SmartCar ejecutándose en http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)
