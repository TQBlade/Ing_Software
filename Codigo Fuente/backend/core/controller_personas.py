# backend/core/controller_personas.py
# Lógica de negocio para el CRUD de Personas y Auditoría (Alineado con bd_carros.sql)

import json
from models.persona import Persona  # Importa el modelo corregido
from core.db.connection import get_connection
# Asumo que auth.py está en core/

# --- Función de Auditoría (Corregida para bd_carros.sql) ---

def _registrar_auditoria(id_vigilante, entidad, id_entidad, accion, datos_previos=None, datos_nuevos=None):
    """
    Función helper para insertar un registro de auditoría.
    Usa los nombres de columna de la tabla 'auditoria' del script SQL.
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
        INSERT INTO auditoria (id_vigilante, entidad, id_entidad, accion, datos_previos, datos_nuevos)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        # Convertimos los dicts a JSON string para guardar en la BD
        val_ant_str = json.dumps(datos_previos) if datos_previos else None
        val_nue_str = json.dumps(datos_nuevos) if datos_nuevos else None
        
        cursor.execute(query, (id_vigilante, entidad, id_entidad, accion, val_ant_str, val_nue_str))
        conn.commit()
        print(f"[Auditoria] Registro creado: {accion} en {entidad} (ID: {id_entidad}) por vigilante {id_vigilante}")
        
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error al registrar auditoría: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# --- Funciones del CRUD de Personas (Corregido) ---

def obtener_personas_controller():
    """
    Obtiene todas las personas activas.
    Usa los campos 'nombre' y 'estado' (INT) del script SQL.
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True) 
        
        # estado = 1 es 'ACTIVO' según la tabla tmstatus
        cursor.execute("SELECT * FROM persona WHERE estado = 1")
        personas_db = cursor.fetchall()
        
        return [Persona(**p).to_dict() for p in personas_db]
        
    except Exception as e:
        print(f"Error en obtener_personas_controller: {e}")
        raise Exception(f"Error interno al obtener personas: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def crear_persona_controller(data, headers):
    """
    Crea una nueva persona.
    Usa los campos 'nombre' y 'estado' (INT) del script SQL.
    """
    conn = None
    cursor = None
    try:
        nueva_persona = Persona.from_dict(data)
        
        id_vigilante_actual = get_vigilante_id_from_token(headers)
        if not id_vigilante_actual:
            raise ValueError("Token inválido o ausente")

        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
        INSERT INTO persona (doc_identidad, nombre, tipo_persona, estado)
        VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query, (
            nueva_persona.doc_identidad,
            nueva_persona.nombre, # Corregido
            nueva_persona.tipo_persona,
            nueva_persona.estado          # Corregido (es INT)
        ))
        
        id_persona_nueva = cursor.lastrowid
        conn.commit()
        
        # Registrar Auditoría (Corregido)
        nueva_persona.id_persona = id_persona_nueva
        _registrar_auditoria(
            id_vigilante=id_vigilante_actual,
            entidad='persona',            # Corregido
            id_entidad=id_persona_nueva,  # Corregido
            accion='CREAR',
            datos_previos=None,           # Corregido
            datos_nuevos=nueva_persona.to_dict() # Corregido
        )
        
        return id_persona_nueva

    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error en crear_persona_controller: {e}")
        raise Exception(f"Error interno al crear persona: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def actualizar_persona_controller(id_persona, data, headers):
    """
    Actualiza una persona existente.
    Usa los campos 'nombre' y 'estado' (INT) del script SQL.
    """
    conn = None
    cursor = None
    try:
        id_vigilante_actual = get_vigilante_id_from_token(headers)
        if not id_vigilante_actual:
            raise ValueError("Token inválido o ausente")

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # 1. Obtener estado ANTERIOR (para Auditoría)
        cursor.execute("SELECT * FROM persona WHERE id_persona = %s", (id_persona,))
        persona_anterior_db = cursor.fetchone()
        
        if not persona_anterior_db:
            raise ValueError("Persona no encontrada")
        
        persona_anterior = Persona(**persona_anterior_db)
        
        # 2. Crear el objeto actualizado
        persona_actualizada = Persona.from_dict(data)
        persona_actualizada.id_persona = id_persona

        # 3. Ejecutar la actualización
        query = """
        UPDATE persona SET
            doc_identidad = %s,
            nombre = %s,
            tipo_persona = %s,
            estado = %s
        WHERE id_persona = %s
        """
        cursor.execute(query, (
            persona_actualizada.doc_identidad,
            persona_actualizada.nombre,         # Corregido
            persona_actualizada.tipo_persona,
            persona_actualizada.estado,         # Corregido
            id_persona
        ))
        
        conn.commit()

        # 4. Registrar Auditoría (Corregido)
        _registrar_auditoria(
            id_vigilante=id_vigilante_actual,
            entidad='persona',             # Corregido
            id_entidad=id_persona,         # Corregido
            accion='ACTUALIZAR',
            datos_previos=persona_anterior.to_dict(), # Corregido
            datos_nuevos=persona_actualizada.to_dict() # Corregido
        )
        
        return True

    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error en actualizar_persona_controller: {e}")
        raise Exception(f"Error interno al actualizar persona: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()