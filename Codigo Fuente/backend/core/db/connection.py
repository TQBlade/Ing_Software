import psycopg2
import os
from dotenv import load_dotenv

# Carga las variables del archivo .env en el entorno
load_dotenv()

def get_connection():
    # Llama a las variables de entorno para la conexión
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT"),
        client_encoding='UTF8'
    )