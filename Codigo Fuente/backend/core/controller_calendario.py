from core.db.connection import get_connection
from psycopg2.extras import RealDictCursor

def obtener_eventos_controller():
    """
    Obtiene todos los eventos para mostrarlos en el calendario.
    Formatea las fechas como cadenas ISO para que React las entienda.
    """
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
            SELECT 
                id_evento,
                titulo,
                descripcion,
                TO_CHAR(fecha_inicio, 'YYYY-MM-DD"T"HH24:MI:SS') as start, -- Formato ISO para React
                TO_CHAR(fecha_fin, 'YYYY-MM-DD"T"HH24:MI:SS') as end,     -- Formato ISO para React
                ubicacion,
                categoria,
                verificado,
                id_creador
            FROM evento
            ORDER BY fecha_inicio DESC;
        """
        cursor.execute(query)
        return cursor.fetchall()
    except Exception as e:
        print(f"Error obteniendo eventos: {e}")
        return []
    finally:
        if conn: conn.close()

def crear_evento_controller(data, usuario_actual):
    """
    Crea un nuevo evento (Solo Admin).
    """
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Obtenemos el ID del usuario que crea el evento (id_audit = nu de tmusuarios)
        id_creador = usuario_actual.get('id_audit')

        query = """
            INSERT INTO evento (titulo, descripcion, fecha_inicio, fecha_fin, ubicacion, categoria, id_creador)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id_evento
        """
        cursor.execute(query, (
            data.get('titulo'),
            data.get('descripcion'),
            data.get('start'), # El frontend debe enviar 'start' (fecha inicio)
            data.get('end'),   # El frontend debe enviar 'end' (fecha fin)
            data.get('ubicacion'),
            data.get('categoria'),
            id_creador
        ))
        
        id_nuevo = cursor.fetchone()[0]
        conn.commit()
        return id_nuevo
    except Exception as e:
        if conn: conn.rollback()
        print(f"Error creando evento: {e}")
        raise e
    finally:
        if conn: conn.close()

def actualizar_evento_controller(id_evento, data):
    """
    Actualiza un evento existente.
    """
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        query = """
            UPDATE evento
            SET titulo = %s, descripcion = %s, fecha_inicio = %s, fecha_fin = %s, ubicacion = %s, categoria = %s
            WHERE id_evento = %s
        """
        cursor.execute(query, (
            data.get('titulo'),
            data.get('descripcion'),
            data.get('start'),
            data.get('end'),
            data.get('ubicacion'),
            data.get('categoria'),
            id_evento
        ))
        conn.commit()
        return True
    except Exception as e:
        if conn: conn.rollback()
        print(f"Error actualizando evento: {e}")
        raise e
    finally:
        if conn: conn.close()

def eliminar_evento_controller(id_evento):
    """
    Elimina un evento.
    """
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM evento WHERE id_evento = %s", (id_evento,))
        conn.commit()
        return True
    except Exception as e:
        if conn: conn.rollback()
        print(f"Error eliminando evento: {e}")
        raise e
    finally:
        if conn: conn.close()

def verificar_evento_controller(id_evento, estado_verificacion):
    """
    Permite al vigilante marcar un evento como 'Verificado' (En curso/Iniciado).
    """
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = "UPDATE evento SET verificado = %s WHERE id_evento = %s"
        cursor.execute(query, (estado_verificacion, id_evento))
        conn.commit()
        return True
    except Exception as e:
        if conn: conn.rollback()
        print(f"Error verificando evento: {e}")
        raise e
    finally:
        if conn: conn.close()