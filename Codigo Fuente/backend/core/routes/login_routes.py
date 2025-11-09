# core/routes/login_routes.py

from flask import Blueprint, request, jsonify
# Importamos nuestro NUEVO modelo
from models.user_model import obtener_datos_usuario 
# Importamos el verificador de hash
from core.security import verify_password, create_jwt_token 

login_bp = Blueprint('login_bp', __name__)

@login_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    if not data or 'usuario' not in data or 'clave' not in data or 'rol' not in data:
        return jsonify({"error": "Faltan datos (usuario, clave, rol)"}), 400

    usuario = data['usuario']
    clave_recibida = data['clave']      # La contraseña en texto plano que envía el usuario
    rol_seleccionado = data['rol']   # El rol que el usuario eligió (Admin/Vigilante)

    try:
        # 1. Llamamos al Modelo para obtener los datos del usuario
        user_data_from_db = obtener_datos_usuario(usuario)

        if not user_data_from_db:
            # El usuario no existe. Mensaje genérico.
            return jsonify({"error": "Usuario o contraseña incorrectos"}), 401

        # Extraemos los datos que nos dio el modelo
        stored_hash = user_data_from_db['clave_hash']
        user_name = user_data_from_db['nombre']
        user_level = user_data_from_db['nivel'] # 0 o 1

        # 2. Llamamos al Módulo de Seguridad para verificar el hash
        if not verify_password(stored_hash, clave_recibida):
            # La contraseña no coincide. Mensaje genérico.
            return jsonify({"error": "Usuario o contraseña incorrectos"}), 401

        # 3. Validamos que el Rol seleccionado coincida con el Nivel de la BD
        # (Nivel 1 = Admin, Nivel 0 = Vigilante)
        es_valido = False
        if rol_seleccionado == "Administrador" and user_level == 1:
            es_valido = True
        elif rol_seleccionado == "Vigilante" and user_level == 0:
            es_valido = True

        if not es_valido:
            # El rol es incorrecto.
            return jsonify({"error": f"Acceso denegado. Usted no tiene permisos de '{rol_seleccionado}'."}), 403

        # 4. ¡Éxito! Creamos el Token JWT
        user_data_for_token = {
            "usuario": usuario,
            "nombre": user_name,
            "nivel": user_level,
            "rol_login": rol_seleccionado
        }
        token = create_jwt_token(user_data_for_token)

        if not token:
            return jsonify({"error": "Error interno al crear la sesión"}), 500

        return jsonify({
            "message": "Inicio de sesión exitoso",
            "token": token,
            "user": user_data_for_token
        }), 200

    except Exception as e:
        print(f"Error grave en el endpoint /login: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500