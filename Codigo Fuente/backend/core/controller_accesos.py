# backend/core/controller_accesos.py
import json
from backend.core.db.connection import get_connection
from backend.models.acceso import (
    verificar_vehiculo_dentro, 
    registrar_salida_db, 
    registrar_entrada_db
)
from backend.ocr.detector import detectar_placa 

# ==========================================================
# 1. FUNCIÓN PARA OBTENER EL HISTORIAL CON FILTROS
# ==========================================================
def obtener_historial_accesos(filtros=None):
    """
    Obtiene el historial filtrado por placa, fechas y tipo de vehículo.
    """
    if filtros is None:
        filtros = {}

    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # Consulta Base
        sql = """
            SELECT 
                a.id_acceso,
                v.placa,
                TO_CHAR(a.fecha_hora, 'HH24:MI:SS') as entrada,
                TO_CHAR(a.hora_salida, 'HH24:MI:SS') as salida,
                TO_CHAR(a.fecha_hora, 'YYYY-MM-DD') as fecha,
                a.resultado,
                v.tipo -- Agregamos tipo para verificar
            FROM acceso a
            JOIN vehiculo v ON a.id_vehiculo = v.id_vehiculo
            WHERE 1=1
        """
        
        params = []

        # --- FILTROS DINÁMICOS ---
        
        # 1. Filtro por Placa (parcial)
        if filtros.get('placa'):
            sql += " AND v.placa ILIKE %s"
            params.append(f"%{filtros['placa']}%")
        
        # 2. Filtro por Tipo de Vehículo
        if filtros.get('tipo'):
            sql += " AND v.tipo = %s"
            params.append(filtros['tipo'])

        # 3. Filtro Desde (Fecha)
        if filtros.get('desde'):
            sql += " AND DATE(a.fecha_hora) >= %s"
            params.append(filtros['desde'])

        # 4. Filtro Hasta (Fecha)
        if filtros.get('hasta'):
            sql += " AND DATE(a.fecha_hora) <= %s"
            params.append(filtros['hasta'])

        # Ordenar descendente
        sql += " ORDER BY a.fecha_hora DESC"

        cur.execute(sql, tuple(params))
        data = cur.fetchall()
        cur.close()
        conn.close()

        # Formateamos para JSON
        historial = []
        for row in data:
            historial.append({
                "id": row[0],
                "placa": row[1],
                "entrada": row[2],
                "salida": row[3] if row[3] else "--",
                "fecha": row[4],
                "estado": row[5],
                "tipo": row[6]
            })
        
        return historial

    except Exception as e:
        print(f"❌ Error obteniendo historial filtrado: {e}")
        return []

# ... (El resto del archivo procesar_validacion_acceso sigue IGUAL, no lo borres) ...
def procesar_validacion_acceso(data_request, vigilante_id):
    # ... MANTÉN TU CÓDIGO DE VALIDACIÓN AQUÍ IGUAL QUE ANTES ...
    # (Para ahorrar espacio no lo repito, pero asegúrate de que esté aquí)
    try:
        data = json.loads(data_request)
        imagen_b64 = data.get("image_base64")
        tipo_acceso = data.get("tipo_acceso")

        if not imagen_b64:
            return {"error": "No hay imagen"}, 400

        placa_detectada = detectar_placa(imagen_b64) 
        
        if not placa_detectada:
            return {"resultado": "Denegado", "datos": {"placa": "No detectada", "motivo": "Imagen ilegible"}}, 200

        print(f"📡 Procesando: Placa {placa_detectada} | Tipo: {tipo_acceso}")

        id_acceso_pendiente = verificar_vehiculo_dentro(placa_detectada)

        if tipo_acceso == 'salida':
            if not id_acceso_pendiente:
                return {"resultado": "Denegado", "datos": {"placa": placa_detectada, "motivo": "El vehículo NO tiene entrada."}}, 200
            else:
                if registrar_salida_db(id_acceso_pendiente):
                    return {"resultado": "Autorizado", "datos": {"placa": placa_detectada, "propietario": "Salida Exitosa"}}, 200
                else:
                    return {"error": "Error DB"}, 500
        else: 
            if id_acceso_pendiente:
                return {"resultado": "Denegado", "datos": {"placa": placa_detectada, "motivo": "El vehículo YA está dentro."}}, 200
            else:
                res = registrar_entrada_db(placa_detectada, vigilante_id)
                if res['status'] == 'ok':
                    return {"resultado": "Autorizado", "datos": {"placa": placa_detectada, "propietario": "Entrada Registrada"}}, 200
                else:
                    return {"resultado": "Denegado", "datos": {"placa": placa_detectada, "motivo": res['mensaje']}}, 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return {"error": str(e)}, 500