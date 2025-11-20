# backend/core/controller_accesos.py
import json
from datetime import datetime
from core.db.connection import get_connection
from psycopg2.extras import RealDictCursor

# --- 1. IMPORTACIONES DE PAQUETE C (OCR) ---
try:
    from ocr.detector import detectar_placa
except ImportError as e:
    print(f"⚠️ ADVERTENCIA (Paquete C): Falta el módulo OCR: {e}")
    detectar_placa = None

# --- 2. FUNCIONES DE BASE DE DATOS (DEFINIDAS AQUÍ) ---

def obtener_historial_accesos():
    """
    Obtiene el historial real desde la BD (uniendo tablas).
    """
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            SELECT 
                a.id_acceso as id, 
                TO_CHAR(a.fecha_hora, 'DD/MM/YYYY') as fecha,
                TO_CHAR(a.fecha_hora, 'HH12:MI AM') as entrada, 
                TO_CHAR(a.fecha_hora + interval '4 hours', 'HH12:MI AM') as salida, 
                a.resultado as estado,
                v.placa
            FROM acceso a
            LEFT JOIN vehiculo v ON a.id_vehiculo = v.id_vehiculo
            ORDER BY a.fecha_hora DESC;
        """
        cursor.execute(query)
        return cursor.fetchall()
    except Exception as e:
        print(f"Error SQL: {e}")
        return []
    finally:
        if conn: conn.close()

def create_acceso(tipo, resultado, observaciones, oid_punto, oid_vigilante, oid_vehiculo):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        query = """
            INSERT INTO acceso (fecha_hora, resultado, observaciones, id_vehiculo, id_punto, id_vigilante)
            VALUES (NOW(), %s, %s, %s, %s, %s)
            RETURNING id_acceso
        """
        cur.execute(query, (resultado, observaciones, oid_vehiculo, oid_punto, oid_vigilante))
        id_acceso = cur.fetchone()[0]
        conn.commit()
        return id_acceso
    except Exception as e:
        if conn: conn.rollback()
        print(f"Error creando acceso: {e}")
        return None
    finally:
        if conn: conn.close()

def create_alerta(tipo, detalle, severidad, oid_acceso, oid_vigilante):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        query = """
            INSERT INTO alerta (tipo, detalle, severidad, id_acceso, id_vigilante)
            VALUES (%s, %s, %s, %s, %s)
        """
        cur.execute(query, (tipo, detalle, severidad, oid_acceso, oid_vigilante))
        conn.commit()
    except Exception as e:
        if conn: conn.rollback()
        print(f"Error creando alerta: {e}")
    finally:
        if conn: conn.close()

def get_vehiculo_by_placa(placa):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        # Nota: Renombramos id_persona -> oid_persona para compatibilidad
        query = """
            SELECT v.id_vehiculo, v.placa, v.tipo, v.color, v.id_persona as oid_persona, 
                   CASE WHEN p.estado = 1 THEN 'Activo' ELSE 'Inactivo' END as estado
            FROM vehiculo v
            JOIN persona p ON v.id_persona = p.id_persona
            WHERE v.placa = %s
        """
        cur.execute(query, (placa,))
        return cur.fetchone()
    except Exception as e:
        print(f"Error buscando vehículo: {e}")
        return None
    finally:
        if conn: conn.close()

def get_persona_by_id(id_persona):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT nombre FROM persona WHERE id_persona = %s", (id_persona,))
        return cur.fetchone()
    except Exception as e:
        print(f"Error buscando persona: {e}")
        return None
    finally:
        if conn: conn.close()


# --- 3. LÓGICA PRINCIPAL DE VALIDACIÓN ---

def procesar_validacion_acceso(request_body, vigilante_id=1, punto_control_id=1):
    """
    Función principal que maneja la lógica de negocio para validar un acceso.
    """
    
    # 1. Validar dependencias críticas
    if not detectar_placa:
        return {"status": "error", "message": "El sistema OCR no está disponible."}, 500

    try:
        # 2. Parsear la solicitud
        # Nota: request_body viene como bytes, lo decodificamos si es necesario
        if isinstance(request_body, bytes):
             data = json.loads(request_body.decode('utf-8'))
        else:
             data = json.loads(request_body)
             
        image_base64 = data.get('image_base64')
        tipo_acceso = data.get('tipo_acceso', 'entrada')

        if not image_base64:
            return {"status": "error", "message": "No se recibió ninguna imagen."}, 400

        print(f"🔄 Procesando solicitud de {tipo_acceso.upper()}...")

        # 3. EJECUTAR OCR
        placa_detectada = detectar_placa(image_base64)

        if not placa_detectada:
            print("❌ OCR falló: No se detectó placa.")
            create_acceso(
                tipo=tipo_acceso,
                resultado="Fallido",
                observaciones="No se pudo detectar placa en la imagen.",
                oid_punto=punto_control_id,
                oid_vigilante=vigilante_id,
                oid_vehiculo=None
            )
            return {
                "status": "ok",
                "resultado": "Fallido",
                "mensaje": "No se pudo detectar una placa clara. Intente de nuevo."
            }, 200

        print(f"✅ Placa detectada: {placa_detectada}")

        # 4. BUSCAR VEHÍCULO
        vehiculo = get_vehiculo_by_placa(placa_detectada)

        # 5. LÓGICA DE AUTORIZACIÓN
        fecha_actual = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if vehiculo and vehiculo.get('estado') == 'Activo':
            # --- CASO: ACCESO AUTORIZADO ---
            propietario = {"nombre": "Desconocido"}
            if vehiculo.get('oid_persona'):
                propietario = get_persona_by_id(vehiculo['oid_persona']) or propietario

            print(f"✅ Acceso AUTORIZADO para {placa_detectada}")
            
            create_acceso(
                tipo=tipo_acceso,
                resultado="Autorizado",
                observaciones="Validación exitosa por OCR.",
                oid_punto=punto_control_id,
                oid_vigilante=vigilante_id,
                oid_vehiculo=vehiculo['id_vehiculo']
            )

            return {
                "status": "ok",
                "resultado": "Autorizado",
                "datos": {
                    "placa": placa_detectada,
                    "vehiculo": f"{vehiculo.get('tipo', '')} {vehiculo.get('color', '')}".strip(),
                    "propietario": propietario.get('nombre'),
                    "fecha_hora": fecha_actual
                }
            }, 200

        else:
            # --- CASO: ACCESO DENEGADO ---
            print(f"⛔ Acceso DENEGADO para {placa_detectada}")
            motivo = "Vehículo no registrado" if not vehiculo else "Vehículo inactivo"

            id_acceso = create_acceso(
                tipo=tipo_acceso,
                resultado="Denegado",
                observaciones=motivo,
                oid_punto=punto_control_id,
                oid_vigilante=vigilante_id,
                oid_vehiculo=vehiculo['id_vehiculo'] if vehiculo else None
            )

            create_alerta(
                tipo="Intento de Acceso No Autorizado",
                detalle=f"Placa {placa_detectada} intentó ingresar. Motivo: {motivo}",
                severidad="media",
                oid_acceso=id_acceso,
                oid_vigilante=vigilante_id
            )

            return {
                "status": "ok",
                "resultado": "Denegado",
                "datos": {
                    "placa": placa_detectada,
                    "motivo": motivo,
                    "fecha_hora": fecha_actual
                }
            }, 200

    except json.JSONDecodeError:
        return {"status": "error", "message": "JSON inválido en el cuerpo de la solicitud."}, 400
    except Exception as e:
        print(f"🔥 Error crítico en controlador de accesos: {e}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": "Error interno del servidor procesando el acceso."}, 500