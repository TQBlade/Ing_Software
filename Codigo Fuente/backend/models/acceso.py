from core.db import get_db_connection
import psycopg2

def create_acceso(tipo, resultado, observaciones, oid_punto, oid_vigilante, oid_vehiculo):
    """
    Registra un nuevo evento de acceso en la base de datos.
    """
    conn = get_db_connection()
    if not conn:
        return None

    try:
        cur = conn.cursor()
        query = """
            INSERT INTO acceso (tipo, resultado, observaciones, oid_punto, oid_vigilante, oid_vehiculo)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id_acceso;
        """
        cur.execute(query, (tipo, resultado, observaciones, oid_punto, oid_vigilante, oid_vehiculo))
        id_acceso = cur.fetchone()[0]
        conn.commit()
        cur.close()
        return id_acceso
    except Exception as e:
        print(f"Error al crear acceso: {e}")
        conn.rollback()
        return None
    finally:
        conn.close()

def get_ultimos_accesos(limite=10):
    """
    Obtiene los últimos accesos para mostrar en el Dashboard o Historial.
    """
    conn = get_db_connection()
    if not conn:
        return []
    try:
        cur = conn.cursor()
        # Hacemos JOIN para traer la placa del vehículo
        query = """
            SELECT a.fecha_hora, v.placa, a.tipo, a.resultado
            FROM acceso a
            LEFT JOIN vehiculo v ON a.oid_vehiculo = v.id_vehiculo
            ORDER BY a.fecha_hora DESC
            LIMIT %s;
        """
        cur.execute(query, (limite,))
        rows = cur.fetchall()
        
        # Formatear resultados como lista de diccionarios
        accesos = [
            {"fecha": row[0].strftime("%Y-%m-%d %H:%M:%S"), "placa": row[1] or "Desconocido", "tipo": row[2], "resultado": row[3]}
            for row in rows
        ]
        cur.close()
        return accesos
    except Exception as e:
        print(f"Error al obtener historial: {e}")
        return []
    finally:
        conn.close()