# backend/routes/personas_routes.py
# Define los Endpoints (/api/personas) usando un Blueprint de Flask.

from flask import Blueprint, request, jsonify
from core.controller_personas import (
    obtener_personas_controller,
    crear_persona_controller,
    actualizar_persona_controller
)
# (Importar aquí los controladores de eliminar, etc. cuando existan)

# 1. Creamos el Blueprint
personas_bp = Blueprint('personas_bp', __name__)

# --- Definición de Rutas ---

# GET /api/personas
@personas_bp.route('/api/personas', methods=['GET'])
def get_personas():
    """
    Endpoint para OBTENER todas las personas.
    """
    try:
        # 1. Llamamos al controlador
        personas = obtener_personas_controller()
        # 2. Devolvemos la respuesta
        return jsonify(personas), 200
        
    except Exception as e:
        print(f"Error en GET /api/personas: {e}")
        return jsonify({"error": "Error interno del servidor", "detalle": str(e)}), 500

# POST /api/personas
@personas_bp.route('/api/personas', methods=['POST'])
def create_persona():
    """
    Endpoint para CREAR una nueva persona.
    """
    try:
        # 1. Obtenemos los datos (JSON) de la petición
        data = request.json
        if not data:
            return jsonify({"error": "Cuerpo de la petición vacío"}), 400
            
        # 2. Obtenemos los headers (para el token JWT)
        headers = request.headers
        
        # 3. Llamamos al controlador
        nuevo_id = crear_persona_controller(data, headers)
        
        # 4. Devolvemos la respuesta
        return jsonify({"mensaje": "Persona creada exitosamente", "id_persona": nuevo_id}), 201

    except ValueError as ve: # Errores de validación (token, etc.)
        return jsonify({"error": str(ve)}), 401 if "Token" in str(ve) else 400
    except Exception as e:
        print(f"Error en POST /api/personas: {e}")
        return jsonify({"error": "Error interno del servidor", "detalle": str(e)}), 500

# PUT /api/personas/<int:id_persona>
@personas_bp.route('/api/personas/<int:id_persona>', methods=['PUT'])
def update_persona(id_persona):
    """
    Endpoint para ACTUALIZAR una persona existente.
    """
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Cuerpo de la petición vacío"}), 400

        headers = request.headers
        
        # 1. Llamamos al controlador
        actualizar_persona_controller(id_persona, data, headers)
        
        # 2. Devolvemos la respuesta
        return jsonify({"mensaje": "Persona actualizada exitosamente"}), 200
        
    except ValueError as ve:
        if "no encontrada" in str(ve):
            return jsonify({"error": str(ve)}), 404
        else: # Error de token, etc.
            return jsonify({"error": str(ve)}), 401
    except Exception as e:
        print(f"Error en PUT /api/personas/{id_persona}: {e}")
        return jsonify({"error": "Error interno del servidor", "detalle": str(e)}), 500