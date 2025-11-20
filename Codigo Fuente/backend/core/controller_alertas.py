from core.db.connection import get_connection
from psycopg2.extras import RealDictCursor

def obtener_alertas_controller():
    """
    Obtiene todas las alertas activas, ordenadas por las más recientes.
    Une información con la tabla de accesos para obtener la fecha exacta.
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
                -- Obtenemos la fecha del acceso asociado, si existe
                TO_CHAR(acc.fecha_hora, 'YYYY-MM-DD HH12:MI AM') as fecha_hora,
                -- Intentamos obtener el nombre del vigilante (si la FK apunta a vigilante)
                -- Si tu tabla alerta usa id_usuario (como auditoria), ajustaremos esto despues.
                -- Por ahora usamos la estructura original de bd_carros.sql
                v.nombre as nombre_vigilante
            FROM alerta al
            LEFT JOIN acceso acc ON al.id_acceso = acc.id_acceso
            LEFT JOIN vigilante v ON al.id_vigilante = v.id_vigilante
            ORDER BY acc.fecha_hora DESC;
        """
        cursor.execute(query)
        return cursor.fetchall()
    except Exception as e:
        print(f"Error obteniendo alertas: {e}")
        return []
    finally:
        if conn: conn.close()

def eliminar_alerta_controller(id_alerta):
    """
    Elimina una alerta de la base de datos (Acción 'Resolver').
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