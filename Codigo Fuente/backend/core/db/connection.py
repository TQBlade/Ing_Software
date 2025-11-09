# core/db/connection.py

import psycopg2
from psycopg2 import pool
from .config import Config  # <-- Asegúrate de que el '.' esté aquí
import sys

# 1. Crear el Pool de Conexión UNA SOLA VEZ
try:
    connection_pool = psycopg2.pool.SimpleConnectionPool(
        minconn=1,
        maxconn=10, # Máximo 10 conexiones simultáneas
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        database=Config.DB_NAME,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD
    )
    print("✅ Pool de conexiones a PostgreSQL creado exitosamente.")

except (Exception, psycopg2.DatabaseError) as error:
    print("❌ Error al crear el pool de conexiones:", error)
    sys.exit(1)


def get_connection():
    """
    Obtiene una conexión del pool.
    """
    try:
        return connection_pool.getconn()
    except Exception as e:
        print(f"❌ Error al obtener conexión del pool: {e}")
        return None

def release_connection(conn):
    """
    Devuelve una conexión al pool para que sea reutilizada.
    (Esta es la función que faltaba)
    """
    if conn:
        connection_pool.putconn(conn)