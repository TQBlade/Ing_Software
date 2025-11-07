import psycopg2
from psycopg2 import Error
from config import Config

def get_connection():
    try:
        connection = psycopg2.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            database=Config.DB_NAME,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD
        )
        return connection
    except Error as e:
        print(f"❌ Error al conectar con PostgreSQL: {e}")
        return None
