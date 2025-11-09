# models/user_model.py

# Importa las funciones correctas del pool de conexión
from core.db.connection import get_connection, release_connection

def obtener_datos_usuario(usuario: str):
    """
    Obtiene los datos de un usuario desde tmusuarios para verificarlo.
    Solo necesita el nombre de usuario.
    """
    conn = None # Inicializa la conexión como None
    try:
        conn = get_connection() # Pide una conexión al pool
        if conn is None:
            print("Error: No se pudo obtener conexión de la base de datos.")
            return None

        with conn.cursor() as cursor:
            # La consulta NUNCA debe incluir la contraseña (clave)
            # Solo buscamos al usuario para OBTENER su hash almacenado.
            cursor.execute("""
                SELECT clave, nombre, nivel 
                FROM tmusuarios 
                WHERE usuario = %s AND fkcods = 1;
            """, (usuario,))
            
            fila = cursor.fetchone()

        if fila:
            # Devolvemos un diccionario fácil de usar
            return {"clave_hash": fila[0], "nombre": fila[1], "nivel": fila[2]}
        else:
            # El usuario no existe
            return None

    except Exception as e:
        print(f"Error en user_model.py al obtener usuario: {e}")
        return None
    
    finally:
        # ¡MUY IMPORTANTE!
        # Esto asegura que la conexión se DEVUELVA al pool,
        # incluso si ocurre un error.
        if conn:
            release_connection(conn)