from core.db.connection import get_connection
from psycopg2.extras import RealDictCursor

def obtener_vehiculos_en_patio():
    """
    Obtiene la lista de vehículos que tienen una entrada SIN una salida posterior.
    Asumimos: id_punto 1 = Entrada, id_punto 2 = Salida (Según bd_carros.sql).
    O mejor aún: Buscamos el último registro de acceso de cada vehículo; si es 'Entrada', está dentro.
    """
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Esta consulta busca el último movimiento de cada carro.
        # Si el último movimiento fue en un punto de tipo 'Entrada', el carro sigue adentro.
        # También traemos el 'id_acceso' para ligar la multa/alerta a esa entrada específica.
        query = """
            SELECT DISTINCT ON (v.placa)
                v.placa,
                v.tipo,
                v.color,
                p.nombre as propietario,
                a.fecha_hora as hora_entrada,
                a.id_acceso,
                pc.tipo as ultima_accion
            FROM acceso a
            JOIN vehiculo v ON a.id_vehiculo = v.id_vehiculo
            JOIN persona p ON v.id_persona = p.id_persona
            JOIN punto_de_control pc ON a.id_punto = pc.id_punto
            ORDER BY v.placa, a.fecha_hora DESC
        """
        
        cursor.execute(query)
        todos_los_movimientos = cursor.fetchall()
        
        # Filtramos en Python (o podríamos hacerlo en SQL con subconsultas)
        # Solo queremos los que su ultima accion fue 'Entrada'
        vehiculos_adentro = [
            veh for veh in todos_los_movimientos 
            if 'Entrada' in veh['ultima_accion'] or 'entrada' in veh['ultima_accion']
        ]
        
        return vehiculos_adentro

    except Exception as e:
        print(f"Error obteniendo vehículos en patio: {e}")
        return []
    finally:
        if conn: conn.close()

def crear_incidente_manual(data, id_vigilante_actual):
    """
    Crea una alerta manual asociada a un acceso.
    """
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        query = """
            INSERT INTO alerta (tipo, detalle, severidad, id_acceso, id_vigilante)
            VALUES (%s, %s, %s, %s, %s)
        """
        
        cursor.execute(query, (
            data.get('tipo'),       # Ej: 'Mal Parqueo'
            data.get('detalle'),    # Descripción del guardia
            data.get('severidad'),  # Alta/Media/Baja
            data.get('id_acceso'),  # El ID de la entrada del vehículo
            id_vigilante_actual     # Quién reporta
        ))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error creando incidente: {e}")
        return False
    finally:
        if conn: conn.close()