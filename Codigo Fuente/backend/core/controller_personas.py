# backend/core/services/controller_personas.py
# Lógica de negocio PURA para Personas.
# Este archivo NO sabe de Flask. Solo hace el trabajo.

import json
from models.persona import Persona
from models.auditoria import Auditoria
from core.db import get_db_connection # Asumo que db.py está en core/
from core.auth import get_vigilante_id_from_token # Asumo que auth.py está en core/

# --- Función de Auditoría (Tu Tarea) ---

def _registrar_auditoria(id_vigilante, accion, tabla, id_registro, valor_anterior, valor_nuevo):
    """
    Función helper para insertar un registro de auditoría en la BD.
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
        INSERT INTO Auditoria (id_vigilante, accion, tabla_afectada, id_registro_afectado, valor_anterior, valor_nuevo)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        val_ant_str = json.dumps(valor_anterior) if valor_anterior else None
        val_nue_str = json.dumps(valor_nuevo) if valor_nuevo else None
        
        cursor.execute(query, (id_vigilante, accion, tabla, id_registro, val_ant_str, val_nue_str))
        conn.commit()
        print(f"[Auditoria] Registro creado: {accion} en {tabla} por vigilante {id_vigilante}")
    except Exception as e:
        if conn: conn.rollback()
        print(f"Error al registrar auditoría: {e}")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# --- Funciones del CRUD de Personas ---

def obtener_personas_controller():
    """
    Obtiene todas las personas.
    Devuelve: Lista de diccionarios de personas.
    Lanza: Excepción si algo falla.
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Persona WHERE estado = TRUE")
        personas_db = cursor.fetchall()
        
        # Convertir resultados a una lista de diccionarios
        return [Persona(**p).to_dict() for p in personas_db]
        
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def crear_persona_controller(data, headers):
    """
    Crea una nueva persona.
    Devuelve: El ID de la nueva persona.
    Lanza: Excepción si algo falla o el token es inválido.
    """
    conn = None
    cursor = None
    try:
        nueva_persona = Persona.from_dict(data)
        
        id_vigilante_actual = get_vigilante_id_from_token(headers)
        if not id_vigilante_actual:
            raise ValueError("Token inválido o ausente") # El Blueprint capturará esto

        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
        INSERT INTO Persona (doc_identidad, nombres, apellidos, tipo_persona, email, telefono, estado)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            nueva_persona.doc_identidad, nueva_persona.nombres, nueva_persona.apellidos,
            nueva_persona.tipo_persona, nueva_persona.email, nueva_persona.telefono,
            nueva_persona.estado
        ))
        
        id_persona_nueva = cursor.lastrowid
        conn.commit()
        
        # Registrar Auditoría
        nueva_persona.id_persona = id_persona_nueva
        _registrar_auditoria(id_vigilante_actual, 'CREAR', 'Persona', id_persona_nueva, None, nueva_persona.to_dict())
        
        return id_persona_nueva

    except Exception as e:
        if conn: conn.rollback()
        raise e # Relanzamos la excepción para que el Blueprint la maneje
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def actualizar_persona_controller(id_persona, data, headers):
    """
    Actualiza una persona existente.
    Devuelve: True si fue exitoso.
    Lanza: Excepción si algo falla o no se encuentra la persona.
    """
    conn = None
    cursor = None
    try:
        id_vigilante_actual = get_vigilante_id_from_token(headers)
        if not id_vigilante_actual:
            raise ValueError("Token inválido o ausente")

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Obtener estado ANTERIOR (para Auditoría)
        cursor.execute("SELECT * FROM Persona WHERE id_persona = %s", (id_persona,))
        persona_anterior_db = cursor.fetchone()
        
        if not persona_anterior_db:
            raise ValueError("Persona no encontrada") # El Blueprint lo convertirá en 404
        
        persona_anterior = Persona(**persona_anterior_db)
        persona_actualizada = Persona.from_dict(data)
        persona_actualizada.id_persona = id_persona # Aseguramos ID

        # Ejecutar actualización
        query = """
        UPDATE Persona SET
            doc_identidad = %s, nombres = %s, apellidos = %s,
            tipo_persona = %s, email = %s, telefono = %s, estado = %s
        WHERE id_persona = %s
        """
        cursor.execute(query, (
            persona_actualizada.doc_identidad, persona_actualizada.nombres, persona_actualizada.apellidos,
            persona_actualizada.tipo_persona, persona_actualizada.email, persona_actualizada.telefono,
            persona_actualizada.estado, id_persona
        ))
        
        conn.commit()

        # Registrar Auditoría
        _registrar_auditoria(
            id_vigilante=id_vigilante_actual, accion='ACTUALIZAR', tabla='Persona',
            id_registro=id_persona,
            valor_anterior=persona_anterior.to_dict(),
            valor_nuevo=persona_actualizada.to_dict()
        )
        return True

    except Exception as e:
        if conn: conn.rollback()
        raise e # Relanzamos la excepción
    finally:
        if cursor: cursor.close()
        if conn: conn.close()