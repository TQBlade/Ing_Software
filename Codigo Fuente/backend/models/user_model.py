from core.db.connection import get_connection

def verificar_usuario(usuario, clave):
    """
    Verifica si el usuario existe en tmusuarios y devuelve su información.
    """
    conn = get_connection()
    if conn is None:
        return None

    cur = conn.cursor()
    cur.execute("""
        SELECT nombre, usuario, nivel 
        FROM tmusuarios 
        WHERE usuario = %s AND clave = %s AND fkcods = 1;
    """, (usuario, clave))

    fila = cur.fetchone()
    cur.close()
    conn.close()

    if fila:
        return {"nombre": fila[0], "usuario": fila[1], "nivel": fila[2]}
    else:
        return None
