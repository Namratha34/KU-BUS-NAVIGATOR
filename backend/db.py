import mysql.connector
import os

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("mysql.railway.internal"),
        user=os.getenv("root"),
        password=os.getenv("QlUHxrpygbWZwbnAwcWmlsSfdTMixSmU"),
        database=os.getenv("railway"),
        port=int(os.getenv("3306"))
    )