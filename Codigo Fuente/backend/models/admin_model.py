from backend.core.db.connection import get_connection

def obtener_datos_dashboard():
    """Resumen de datos generales para administrador"""
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("SELECT COUNT(*) FROM vehiculo;")
        total_vehiculos = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM acceso;")
        total_accesos = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM alerta;")
        total_alertas = cur.fetchone()[0]

        cur.close()
        conn.close()

        return {
            "total_vehiculos": total_vehiculos,
            "total_accesos": total_accesos,
            "total_alertas": total_alertas
        }

    except Exception as e:
        print("❌ Error en obtener_datos_dashboard:", e)
        return {}


def obtener_accesos_detalle():
    """Lista todos los accesos con datos del vehículo y propietario"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                v.placa,
                v.tipo,
                v.color,
                p.nombre AS propietario,
                a.resultado
            FROM acceso a
            JOIN vehiculo v ON a.id_vehiculo = v.id_vehiculo
            JOIN persona p ON v.id_persona = p.id_persona
            ORDER BY a.id_acceso ASC;
        """)
        data = cur.fetchall()
        cur.close()
        conn.close()

        return [
            {
                "placa": r[0],
                "tipo": r[1],
                "color": r[2],
                "propietario": r[3],
                "resultado": r[4]
            } for r in data
        ]
    except Exception as e:
        print("❌ Error en obtener_accesos_detalle:", e)
        return []


def registrar_vigilante(nombre, doc, telefono, id_rol):
    """Registrar nuevo vigilante"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO vigilante (nombre, doc_identidad, telefono, id_rol, estado)
            VALUES (%s, %s, %s, %s, 1)
        """, (nombre, doc, telefono, id_rol))
        conn.commit()
        cur.close()
        conn.close()
        return True
    except Exception as e:
        print("❌ Error en registrar_vigilante:", e)
        return False

from backend.core.db.connection import get_connection
from psycopg2.extras import RealDictCursor

def obtener_data_reporte_completo(fecha_inicio, fecha_fin):
    """
    Recopila toda la información para el reporte gerencial en el rango de fechas.
    """
    data = {
        "estadisticas": {},
        "accesos": [],
        "alertas_resueltas": [],
        "novedades": [],
        "hora_pico": None
    }
    
    conn = get_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # 1. ESTADÍSTICAS GENERALES
        # Total vehículos, Accesos permitidos vs denegados
        sql_stats = """
            SELECT 
                COUNT(*) as total_movimientos,
                SUM(CASE WHEN resultado ILIKE '%%Autorizado%%' THEN 1 ELSE 0 END) as autorizados,
                SUM(CASE WHEN resultado ILIKE '%%Denegado%%' THEN 1 ELSE 0 END) as denegados
            FROM acceso
            WHERE DATE(fecha_hora) BETWEEN %s AND %s
        """
        cur.execute(sql_stats, (fecha_inicio, fecha_fin))
        data["estadisticas"] = cur.fetchone()

        # 2. HORA PICO (Hora con más afluencia)
        sql_pico = """
            SELECT EXTRACT(HOUR FROM fecha_hora) as hora, COUNT(*) as cantidad
            FROM acceso
            WHERE DATE(fecha_hora) BETWEEN %s AND %s
            GROUP BY hora
            ORDER BY cantidad DESC
            LIMIT 1
        """
        cur.execute(sql_pico, (fecha_inicio, fecha_fin))
        data["hora_pico"] = cur.fetchone()

        # 3. DETALLE DE ACCESOS
        sql_accesos = """
            SELECT TO_CHAR(a.fecha_hora, 'YYYY-MM-DD HH24:MI') as fecha, 
                   v.placa, v.tipo, a.resultado, u.nombre as vigilante
            FROM acceso a
            LEFT JOIN vehiculo v ON a.id_vehiculo = v.id_vehiculo
            JOIN vigilante u ON a.id_vigilante = u.id_vigilante -- OJO: Ajustar si usas tmusuarios
            WHERE DATE(a.fecha_hora) BETWEEN %s AND %s
            ORDER BY a.fecha_hora DESC
        """
        cur.execute(sql_accesos, (fecha_inicio, fecha_fin))
        data["accesos"] = cur.fetchall()

        # 4. ALERTAS RESUELTAS (Desde Auditoría)
        # Buscamos en auditoría quién resolvió qué alerta
        sql_alertas = """
            SELECT TO_CHAR(au.fecha_hora, 'YYYY-MM-DD HH24:MI') as fecha_resolucion,
                   u.nombre as resolutor,
                   au.datos_previos, -- Aquí está la info de la alerta original
                   au.datos_nuevos   -- Aquí está la acción tomada (Multa, Advertencia)
            FROM auditoria au
            JOIN tmusuarios u ON au.id_usuario = u.nu
            WHERE au.entidad = 'ALERTA' AND au.accion = 'RESOLVER_ALERTA'
            AND DATE(au.fecha_hora) BETWEEN %s AND %s
        """
        cur.execute(sql_alertas, (fecha_inicio, fecha_fin))
        data["alertas_resueltas"] = cur.fetchall()

        # 5. NOVEDADES DE VIGILANTES
        sql_novedades = """
            SELECT TO_CHAR(n.fecha_hora, 'YYYY-MM-DD HH24:MI') as fecha,
                   n.asunto, n.descripcion, u.nombre as vigilante
            FROM novedad n
            JOIN tmusuarios u ON n.id_usuario = u.nu
            WHERE DATE(n.fecha_hora) BETWEEN %s AND %s
            ORDER BY n.fecha_hora DESC
        """
        cur.execute(sql_novedades, (fecha_inicio, fecha_fin))
        data["novedades"] = cur.fetchall()

        cur.close()
        return data

    except Exception as e:
        print(f"Error generando datos reporte: {e}")
        return None
    finally:
        if conn: conn.close()

# MANTÉN LAS OTRAS FUNCIONES QUE YA EXISTÍAN (obtener_datos_dashboard, etc.)
# ...