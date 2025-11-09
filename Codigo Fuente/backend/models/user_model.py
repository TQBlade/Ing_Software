from core.db.connection import get_connection

def verificar_usuario(usuario, clave, rol):
    try:
        conn = get_connection()
        cur = conn.cursor()

        query = """
            SELECT nombre, usuario, clave, nivel
            FROM tmusuarios
            WHERE LOWER(usuario) = LOWER(%s)
              AND clave = %s
        """
        cur.execute(query, (usuario, clave))
        result = cur.fetchone()

        cur.close()
        conn.close()

        print("🔍 Resultado BD:", result)
        print("🧩 Rol recibido:", rol)

        if not result:
            print("❌ No se encontró el usuario o clave incorrecta.")
            return None

        nombre, user_db, clave_db, nivel = result
        print("✅ Usuario encontrado:", nombre, "| Nivel:", nivel)

        # Validación correcta:
        if rol == "Administrador" and nivel != 1:
            print("🚫 Nivel no coincide con Administrador (debería ser 1)")
            return None
        elif rol == "Vigilante" and nivel != 0:
            print("🚫 Nivel no coincide con Vigilante (debería ser 0)")
            return None

        print("✅ Rol validado correctamente:", rol)
        return {
            "nombre": nombre,
            "usuario": user_db,
            "nivel": nivel,
            "rol": rol
        }

    except Exception as e:
        print("❌ Error en verificar_usuario:", e)
        return None
