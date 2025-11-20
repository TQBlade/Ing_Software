from core.db.connection import get_connection
from psycopg2.extras import RealDictCursor
from datetime import datetime

def obtener_alertas_controller():
    """
    Obtiene todas las alertas registradas, uniendo con vigilante para saber quién estaba de turno.
    """
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
            SELECT 
                al.id_alerta,
                al.tipo,
                al.detalle,
                al.severidad,
                al.id_acceso,
                v.nombre as nombre_vigilante,
                -- Si tienes fecha en la alerta úsala, si no, usamos la del acceso o simulamos 'Ahora'
                -- Basado en tu SQL, alerta no tiene fecha propia, así que tomamos la del acceso asociado
                acc.fecha_hora as fecha_hora
            FROM alerta al
            LEFT JOIN vigilante v ON al.id_vigilante = v.id_vigilante
            LEFT JOIN acceso acc ON al.id_acceso = acc.id_acceso
            ORDER BY acc.fecha_hora DESC;
        """
        cursor.execute(query)
        return cursor.fetchall()
    except Exception as e:
        print(f"Error obteniendo alertas: {e}")
        return []
    finally:
        if conn: conn.close()

def crear_alerta_manual_controller(data, usuario_actual):
    """
    Permite crear una alerta manual (sin un acceso específico asociado obligatoriamente).
    Nota: Tu BD exige 'id_acceso' NOT NULL. 
    Para alertas manuales, tendríamos que asociarla a un acceso dummy o modificar la BD.
    *Por ahora, asumiremos que es solo para listar las automáticas.*
    """
    pass 

def eliminar_alerta_controller(id_alerta):
    """
    Elimina una alerta (para 'resolverla').
    """
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM alerta WHERE id_alerta = %s", (id_alerta,))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error eliminando alerta: {e}")
        return False
    finally:
        if conn: conn.close()