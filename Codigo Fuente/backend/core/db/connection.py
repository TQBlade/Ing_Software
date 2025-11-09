# core/db/connection.py

import psycopg2
from psycopg2 import pool
from .config import Config
import sys

# 1. Construir los parámetros de conexión
connection_params = {
    'host': Config.DB_HOST,
    'port': Config.DB_PORT,
    'database': Config.DB_NAME,
    'user': Config.DB_USER,
    'password': Config.DB_PASSWORD,
    'client_encoding': 'UTF8'
}

# 2. Crear el Pool de Conexión usando parámetros directos
try:
    connection_pool = psycopg2.pool.SimpleConnectionPool(
        minconn=1,
        maxconn=10,
        **connection_params
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
    """
    if conn:
        connection_pool.putconn(conn)