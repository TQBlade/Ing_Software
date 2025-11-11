# backend/core/controller_vehiculos.py
# Lógica de negocio para el CRUD de Vehiculos (Alineado con bd_carros.sql)

import json
from models.vehiculo import Vehiculo # Importa el modelo corregido
from core.db.connection import get_connection

# Importamos la función de auditoría CORREGIDA del controlador de personas
from core.controller_personas import _registrar_auditoria 


# --- Funciones del CRUD de Vehiculos (Corregido) ---

def obtener_vehiculos_controller():
    """
    Obtiene todos los vehículos, incluyendo datos del propietario.
    Usa los campos del script SQL.
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Query corregida: une vehiculo con persona para obtener el 'nombre'
        query = """
        SELECT 
            v.id_vehiculo, v.placa, v.tipo, v.color, v.id_persona,
            p.nombre AS propietario_nombre, 
            p.doc_identidad AS propietario_doc_identidad
        FROM vehiculo v
        JOIN persona p ON v.id_persona = p.id_persona
        WHERE p.estado = 1; 
        """
        cursor.execute(query)
        vehiculos_db = cursor.fetchall()
        
        # Formato de respuesta con la información del dueño
        vehiculos_lista = []
        for v in vehiculos_db:
            vehiculo_data = {
                "id_vehiculo": v['id_vehiculo'],
                "placa": v['placa'],
                "tipo": v['tipo'],
                "color": v['color'],
                "id_persona": v['id_persona'],
                "propietario": {
                    "id_persona": v['id_persona'],
                    "nombre": v['propietario_nombre'],
                    "doc_identidad": v['propietario_doc_identidad']
                }
            }
            vehiculos_lista.append(vehiculo_data)

        return vehiculos_lista
        
    except Exception as e:
        print(f"Error en obtener_vehiculos_controller: {e}")
        raise Exception(f"Error interno al obtener vehículos: {str(e)}")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def crear_vehiculo_controller(data, headers):
    """
    Crea un nuevo vehículo.
    Usa los campos 'tipo' y 'color' del script SQL.
    """
    conn = None
    cursor = None
    try:
        nuevo_vehiculo = Vehiculo.from_dict(data)
        
        id_vigilante_actual = get_vigilante_id_from_token(headers)
        if not id_vigilante_actual:
            raise ValueError("Token inválido o ausente")

        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Verificar si id_persona (propietario) existe
        cursor.execute("SELECT id_persona FROM persona WHERE id_persona = %s AND estado = 1", (nuevo_vehiculo.id_persona,))
        if not cursor.fetchone():
            raise ValueError(f"La Persona (propietario) con ID {nuevo_vehiculo.id_persona} no existe o está inactiva.")
            
        # 2. Insertar Vehiculo (Campos corregidos)
        query = """
        INSERT INTO vehiculo (placa, tipo, color, id_persona)
        VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query, (
            nuevo_vehiculo.placa,
            nuevo_vehiculo.tipo,  # Corregido
            nuevo_vehiculo.color, # Corregido
            nuevo_vehiculo.id_persona
        ))
        
        id_vehiculo_nuevo = cursor.lastrowid
        conn.commit()
        
        # 3. Registrar Auditoría (Corregido)
        nuevo_vehiculo.id_vehiculo = id_vehiculo_nuevo
        _registrar_auditoria(
            id_vigilante=id_vigilante_actual,
            entidad='vehiculo',           # Corregido
            id_entidad=id_vehiculo_nuevo, # Corregido
            accion='CREAR',
            datos_previos=None,           # Corregido
            datos_nuevos=nuevo_vehiculo.to_dict() # Corregido
        )
        
        return id_vehiculo_nuevo

    except Exception as e:
        if conn: conn.rollback()
        print(f"Error en crear_vehiculo_controller: {e}")
        raise Exception(f"Error interno al crear vehículo: {str(e)}")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


def actualizar_vehiculo_controller(id_vehiculo, data, headers):
    """
    Actualiza un vehículo existente.
    Usa los campos 'tipo' y 'color' del script SQL.
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
        cursor.execute("SELECT * FROM vehiculo WHERE id_vehiculo = %s", (id_vehiculo,))
        vehiculo_anterior_db = cursor.fetchone()
        
        if not vehiculo_anterior_db:
            raise ValueError("Vehiculo no encontrado")
        
        vehiculo_anterior = Vehiculo(**vehiculo_anterior_db)
        
        # 2. Crear objeto actualizado y verificar propietario
        vehiculo_actualizado = Vehiculo.from_dict(data)
        vehiculo_actualizado.id_vehiculo = id_vehiculo 

        cursor.execute("SELECT id_persona FROM persona WHERE id_persona = %s AND estado = 1", (vehiculo_actualizado.id_persona,))
        if not cursor.fetchone():
            raise ValueError(f"La nueva Persona (propietario) con ID {vehiculo_actualizado.id_persona} no existe o está inactiva.")

        # 3. Ejecutar la actualización (Campos corregidos)
        query = """
        UPDATE vehiculo SET
            placa = %s,
            tipo = %s,
            color = %s,
            id_persona = %s
        WHERE id_vehiculo = %s
        """
        cursor.execute(query, (
            vehiculo_actualizado.placa,
            vehiculo_actualizado.tipo,    # Corregido
            vehiculo_actualizado.color,   # Corregido
            vehiculo_actualizado.id_persona,
            id_vehiculo
        ))
        
        conn.commit()

        # 4. Registrar Auditoría (Corregido)
        _registrar_auditoria(
            id_vigilante=id_vigilante_actual,
            entidad='vehiculo',            # Corregido
            id_entidad=id_vehiculo,        # Corregido
            accion='ACTUALIZAR',
            datos_previos=vehiculo_anterior.to_dict(), # Corregido
            datos_nuevos=vehiculo_actualizado.to_dict() # Corregido
        )
        return True

    except Exception as e:
        if conn: conn.rollback()
        print(f"Error en actualizar_vehiculo_controller: {e}")
        raise Exception(f"Error interno al actualizar vehículo: {str(e)}")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()