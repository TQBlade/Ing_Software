import psycopg2
from flask import g, current_app

def init_db(app):
    app.teardown_appcontext(close_db)

def get_db():
    if "db" not in g:
        g.db = psycopg2.connect(
            host=current_app.config["DB_HOST"],
            dbname=current_app.config["DB_NAME"],
            user=current_app.config["DB_USER"],
            password=current_app.config["DB_PASSWORD"],
            port=current_app.config["DB_PORT"]
        )
    return g.db

def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()
