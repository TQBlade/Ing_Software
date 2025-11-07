from flask import Blueprint, request, jsonify
from models.user_model import verificar_usuario  # import relativo
# ↑ sube de routes/ a core/ y entra a models/

# ==========================================================
# 🔹 Definición del Blueprint
# ==========================================================
login_bp = Blueprint('login_bp', __name__)

# ==========================================================
# 🔐 Ruta de inicio de sesión
# ==========================================================
@login_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    usuario = data.get('usuario')
    clave = data.get('clave')
    rol = data.get('rol')  # si tu formulario incluye el rol

    # Validación de campos vacíos
    if not usuario or not clave:
        return jsonify({"error": "Debe ingresar usuario y contraseña"}), 400

    # Llamar al modelo para verificar en la base de datos
    user = verificar_usuario(usuario, clave)

    if user:
        # Validar el rol (opcional)
        if rol and rol.lower() != user.get("rol", "").lower():
            return jsonify({"error": "El rol seleccionado no coincide con el usuario."}), 403

        return jsonify({
            "mensaje": "Acceso concedido",
            "usuario": user
        }), 200
    else:
        return jsonify({"error": "Credenciales incorrectas"}), 401
