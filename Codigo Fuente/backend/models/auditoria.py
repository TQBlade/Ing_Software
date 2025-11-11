# backend/models/auditoria.py
# Representación de la tabla 'auditoria' (alineada con bd_carros.sql)
import sys
import os
from psycopg2.extras import RealDictCursor
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.db.connection import get_connection

class Auditoria:
    def __init__(self, id_auditoria, id_vigilante, entidad, id_entidad, accion, datos_previos=None, datos_nuevos=None, fecha_hora=None):
        """
        Clase que representa un registro de auditoría.
        """
        self.id_auditoria = id_auditoria
        self.fecha_hora = fecha_hora or datetime.now()
        self.entidad = entidad            # Ej: 'persona', 'vehiculo'
        self.id_entidad = id_entidad      # El ID del registro afectado
        self.accion = accion              # 'CREAR', 'ACTUALIZAR', 'ELIMINAR'
        self.id_vigilante = id_vigilante    # Quién hizo el cambio
        self.datos_previos = datos_previos    # Estado JSON/Texto antes
        self.datos_nuevos = datos_nuevos      # Estado JSON/Texto después

    def to_dict(self):
        """
        Convierte el objeto en un diccionario para serialización (JSON).
        """
        return {
            "id_auditoria": self.id_auditoria,
            "fecha_hora": self.fecha_hora.isoformat() if self.fecha_hora else None,
            "entidad": self.entidad,
            "id_entidad": self.id_entidad,
            "accion": self.accion,
            "id_vigilante": self.id_vigilante,
            "datos_previos": self.datos_previos,
            "datos_nuevos": self.datos_nuevos
        }

# --- ¡CORRECCIÓN AQUÍ! ---
# La función debe estar FUERA (sin indentación) de la clase Auditoria.

def obtener_historial_auditoria():
    """
    Obtiene todos los registros del historial de auditoría, uniendo el id_vigilante
    con la tabla de personas para mostrar el nombre del responsable.
    """
    conn = None
    try:
        conn = get_connection()
        # Usamos RealDictCursor para que el resultado sea una lista de diccionarios
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Esta consulta une auditoria con persona para obtener el nombre del vigilante
        # y ordena por fecha descendente para mostrar lo más reciente primero.
        query = """
            SELECT 
                a.id_auditoria,
                a.fecha_hora,
                p.nombre AS nombre_vigilante,
                a.entidad,
                a.id_entidad,
                a.accion,
                a.datos_previos,
                a.datos_nuevos
            FROM 
                auditoria a
            LEFT JOIN 
                persona p ON a.id_vigilante = p.id_persona
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
    # (Esto también debe estar fuera de la clase)
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