import mysql.connector
import os

def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get('HOST'),
        user=os.environ.get('USER'),
        password=os.environ.get('PASSWORD'),
        database=os.environ.get('NAME'),
        port=int(os.environ.get('PORT', 4000)),
        # Use these two lines instead of a CA Path:
        ssl_verify_identity=True, 
        ssl_disabled=False
    )