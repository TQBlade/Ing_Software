import psycopg2

def get_connection():
    return psycopg2.connect(
        host="localhost",
        database="bd_carros",
        user="postgres",
        password="123456",
        port="5432",
        options='-c client_encoding=UTF8'
    )
