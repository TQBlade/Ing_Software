import json
from datetime import datetime

# --- IMPORTACIONES DE TU PAQUETE (C) ---
try:
    from ocr.detector import detectar_placa
    # Asumimos que ya creaste este modelo siguiendo las instrucciones anteriores
    from models.acceso import create_acceso 
    # Necesitarás crear este modelo también para registrar las alertas
    from models.alerta import create_alerta
except ImportError as e:
    print(f"⚠️ ADVERTENCIA (Paquete C): Faltan módulos propios: {e}")
    detectar_placa = None
    create_acceso = None
    create_alerta = None

# --- IMPORTACIONES DE PAQUETE B (Gestión) ---
try:
    from models.vehiculo import get_vehiculo_by_placa
    from models.persona import get_persona_by_id
except ImportError:
    print("⚠️ ADVERTENCIA (Paquete B): Faltan modelos de Vehículo/Persona. Se usarán datos simulados si es necesario.")
    get_vehiculo_by_placa = None
    get_persona_by_id = None

# --- IMPORTACIONES DE PAQUETE A (Fundación) ---
try:
    # Necesitamos saber QUÉ vigilante está haciendo la validación
    # Esto vendrá del token JWT decodificado
    pass 
except ImportError:
    pass

def procesar_validacion_acceso(request_body, vigilante_id=1, punto_control_id=1):
    """
    Función principal que maneja la lógica de negocio para validar un acceso.
    Recibe el cuerpo de la solicitud (JSON string) y el ID del vigilante actual.
    """
    
    # 1. Validar dependencias críticas
    if not detectar_placa:
        return {"status": "error", "message": "El sistema OCR no está disponible."}, 500

    try:
        # 2. Parsear la solicitud
        data = json.loads(request_body)
        image_base64 = data.get('image_base64')
        tipo_acceso = data.get('tipo_acceso', 'entrada') # 'entrada' o 'salida'

        if not image_base64:
            return {"status": "error", "message": "No se recibió ninguna imagen."}, 400

        print(f"🔄 Procesando solicitud de {tipo_acceso.upper()}...")

        # 3. EJECUTAR OCR (Tu módulo estrella)
        placa_detectada = detectar_placa(image_base64)

        if not placa_detectada:
            print("❌ OCR falló: No se detectó placa.")
            # Registramos el intento fallido
            if create_acceso:
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

        # 4. BUSCAR VEHÍCULO (Dependencia de Paquete B)
        vehiculo = None
        if get_vehiculo_by_placa:
            vehiculo = get_vehiculo_by_placa(placa_detectada)
        else:
            # MOCK (Simulación) si Paquete B no está listo
            # Simulamos que la placa 'ABC123' sí existe, las demás no.
            if placa_detectada == "ABC123":
                vehiculo = {"id_vehiculo": 99, "placa": "ABC123", "estado": "Activo", "oid_persona": 55}
            else:
                vehiculo = None

        # 5. LÓGICA DE AUTORIZACIÓN
        fecha_actual = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if vehiculo and vehiculo.get('estado') == 'Activo':
            # --- CASO: ACCESO AUTORIZADO ---
            propietario = {"nombre": "Desconocido"}
            # Buscar datos del dueño (Dependencia Paquete B)
            if get_persona_by_id and vehiculo.get('oid_persona'):
                propietario = get_persona_by_id(vehiculo['oid_persona']) or propietario
            elif vehiculo.get('oid_persona') == 55: # Mock
                propietario = {"nombre": "Juan Pérez (Simulado)"}

            print(f"✅ Acceso AUTORIZADO para {placa_detectada}")
            
            # Registrar en BD
            if create_acceso:
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
                    "vehiculo": f"{vehiculo.get('marca', '')} {vehiculo.get('modelo', '')} {vehiculo.get('color', '')}".strip() or "Vehículo Registrado",
                    "propietario": propietario.get('nombre'),
                    "fecha_hora": fecha_actual
                }
            }, 200

        else:
            # --- CASO: ACCESO DENEGADO ---
            print(f"⛔ Acceso DENEGADO para {placa_detectada}")
            motivo = "Vehículo no registrado" if not vehiculo else "Vehículo inactivo o bloqueado"

            # 1. Registrar Acceso Denegado
            id_acceso = None
            if create_acceso:
                id_acceso = create_acceso(
                    tipo=tipo_acceso,
                    resultado="Denegado",
                    observaciones=motivo,
                    oid_punto=punto_control_id,
                    oid_vigilante=vigilante_id,
                    oid_vehiculo=vehiculo['id_vehiculo'] if vehiculo else None
                )

            # 2. Generar Alerta Automática (Tu responsabilidad también)
            if create_alerta:
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