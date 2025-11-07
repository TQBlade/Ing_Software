from flask import Blueprint, request, jsonify
from services.jwt_service import create_token
from db.connection import get_db

auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, nombre FROM usuarios WHERE usuario=%s AND clave=%s", (username, password))
    user = cur.fetchone()

    if not user:
        return jsonify({"error": "Credenciales inválidas"}), 401

    token = create_token({"id": user[0], "nombre": user[1]})
    return jsonify({"token": token, "user": user[1]}), 200
