import sys
import os
from psycopg2.extras import RealDictCursor

# Asegurar que la ruta 'backend' esté en sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.db.connection import get_connection

def obtener_historial_auditoria():
    """
    Obtiene todos los registros del historial de auditoría.
    CORREGIDO: Ahora se une con 'tmusuarios' usando 'id_usuario'.
    """
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # --- CONSULTA CORREGIDA ---
        query = """
            SELECT 
                a.id_auditoria,
                a.fecha_hora,
                u.nombre AS nombre_vigilante, -- Se une con tmusuarios
                a.entidad,
                a.id_entidad,
                a.accion,
                a.datos_previos,
                a.datos_nuevos,
                a.id_usuario -- Se usa la columna renombrada
            FROM 
                auditoria a
            LEFT JOIN 
                tmusuarios u ON a.id_usuario = u.nu -- Se une a tmusuarios(nu)
            ORDER BY 
                a.fecha_hora DESC;
        """
        
        cur.execute(query)
        historial = cur.fetchall()
        
        cur.close()
        return historial
        
    except Exception as e:
        print(f"❌ Error en models/auditoria.py (obtener_historial_auditoria): {e}")
        # Propagar la excepción para que el controlador la maneje
        raise e
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    # --- Prueba rápida para verificar la función ---
    try:
        print("Probando obtener_historial_auditoria...")
        historial = obtener_historial_auditoria()
        if historial:
            print(f"✅ Se obtuvieron {len(historial)} registros.")
            print("Primer registro:", historial[0])
        else:
            print("ℹ️  No se encontraron registros de auditoría.")
    except Exception as e:
        print(f"⚠️  Error en la prueba: {e}")