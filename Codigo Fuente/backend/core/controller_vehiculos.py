# backend/core/controller_vehiculos.py
# Lógica de negocio para el CRUD de Vehiculos y Auditoría

import json
from models.vehiculo import Vehiculo
from core.db import get_db_connection
from core.auth import get_vigilante_id_from_token 
# Importamos la función de auditoría del controlador de personas
# NOTA: En un proyecto real, _registrar_auditoria debería ir en core/utils.py o core/auditoria_utils.py
from core.controller_personas import _registrar_auditoria 


# --- Funciones del CRUD de Vehiculos ---

def obtener_vehiculos_controller():
    """
    Obtiene todos los vehículos de la base de datos, incluyendo datos del propietario.
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Query que trae la información del vehículo y une los datos del propietario
        query = """
        SELECT 
            v.*, 
            p.nombres AS propietario_nombres, 
            p.apellidos AS propietario_apellidos,
            p.doc_identidad AS propietario_doc_identidad
        FROM Vehiculo v
        JOIN Persona p ON v.id_propietario = p.id_persona
        WHERE v.estado = TRUE;
        """
        cursor.execute(query)
        vehiculos_db = cursor.fetchall()
        
        # Formato de respuesta con la información del dueño
        vehiculos_lista = []
        for v in vehiculos_db:
            vehiculo_data = Vehiculo(**v).to_dict()
            vehiculo_data['propietario'] = {
                'id_persona': v['id_propietario'],
                'nombres': v['propietario_nombres'],
                'apellidos': v['propietario_apellidos'],
                'doc_identidad': v['propietario_doc_identidad']
            }
            vehiculos_lista.append(vehiculo_data)

        return vehiculos_lista
        
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def crear_vehiculo_controller(data, headers):
    """
    Crea un nuevo vehículo en la base de datos e inserta registro de auditoría.
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
        
        # 1. Verificar si el id_propietario existe (Integridad referencial)
        cursor.execute("SELECT id_persona FROM Persona WHERE id_persona = %s AND estado = TRUE", (nuevo_vehiculo.id_propietario,))
        if not cursor.fetchone():
            raise ValueError(f"El Propietario con ID {nuevo_vehiculo.id_propietario} no existe o está inactivo.")
            
        # 2. Insertar Vehiculo
        query = """
        INSERT INTO Vehiculo (placa, id_propietario, marca, modelo, color, tipo_vehiculo, estado)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            nuevo_vehiculo.placa, nuevo_vehiculo.id_propietario, nuevo_vehiculo.marca,
            nuevo_vehiculo.modelo, nuevo_vehiculo.color, nuevo_vehiculo.tipo_vehiculo,
            nuevo_vehiculo.estado
        ))
        
        id_vehiculo_nuevo = cursor.lastrowid
        conn.commit()
        
        # 3. Registrar Auditoría (Tu tarea)
        nuevo_vehiculo.id_vehiculo = id_vehiculo_nuevo
        _registrar_auditoria(
            id_vigilante=id_vigilante_actual, accion='CREAR', tabla='Vehiculo',
            id_registro=id_vehiculo_nuevo, valor_anterior=None, valor_nuevo=nuevo_vehiculo.to_dict()
        )
        
        return id_vehiculo_nuevo

    except Exception as e:
        if conn: conn.rollback()
        raise e 
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


def actualizar_vehiculo_controller(id_vehiculo, data, headers):
    """
    Actualiza un vehículo existente e inserta registro de auditoría.
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
        cursor.execute("SELECT * FROM Vehiculo WHERE id_vehiculo = %s", (id_vehiculo,))
        vehiculo_anterior_db = cursor.fetchone()
        
        if not vehiculo_anterior_db:
            raise ValueError("Vehiculo no encontrado")
        
        vehiculo_anterior = Vehiculo(**vehiculo_anterior_db)
        
        # 2. Verificar nuevo id_propietario si se proporciona
        vehiculo_actualizado = Vehiculo.from_dict(data)
        if vehiculo_actualizado.id_propietario is not None:
             cursor.execute("SELECT id_persona FROM Persona WHERE id_persona = %s AND estado = TRUE", (vehiculo_actualizado.id_propietario,))
             if not cursor.fetchone():
                 raise ValueError(f"El nuevo Propietario con ID {vehiculo_actualizado.id_propietario} no existe o está inactivo.")
        else:
             vehiculo_actualizado.id_propietario = vehiculo_anterior.id_propietario # Mantener el anterior si no se actualiza

        vehiculo_actualizado.id_vehiculo = id_vehiculo 

        # 3. Ejecutar la actualización
        query = """
        UPDATE Vehiculo SET
            placa = %s, id_propietario = %s, marca = %s,
            modelo = %s, color = %s, tipo_vehiculo = %s, estado = %s
        WHERE id_vehiculo = %s
        """
        cursor.execute(query, (
            vehiculo_actualizado.placa, vehiculo_actualizado.id_propietario, vehiculo_actualizado.marca,
            vehiculo_actualizado.modelo, vehiculo_actualizado.color, vehiculo_actualizado.tipo_vehiculo,
            vehiculo_actualizado.estado, id_vehiculo
        ))
        
        conn.commit()

        # 4. Registrar Auditoría (Tu tarea)
        _registrar_auditoria(
            id_vigilante=id_vigilante_actual, accion='ACTUALIZAR', tabla='Vehiculo',
            id_registro=id_vehiculo,
            valor_anterior=vehiculo_anterior.to_dict(),
            valor_nuevo=vehiculo_actualizado.to_dict()
        )
        return True

    except Exception as e:
        if conn: conn.rollback()
        raise e 
    finally:
        if cursor: cursor.close()
        if conn: conn.close()