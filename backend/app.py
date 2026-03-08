from flask import Flask, render_template, jsonify, request, send_from_directory
from flask_cors import CORS
from backend.db import get_db_connection
import hashlib
import os
import mysql.connector


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))

app = Flask(
    __name__,template_folder=os.path.join(ROOT_DIR, "templates")
)

CORS(app)
 
# -------------------------------
# STATIC FILES
# -------------------------------

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

@app.route("/css/<path:filename>")
def css(filename):
    return send_from_directory(os.path.join(ROOT_DIR, "css"), filename)

@app.route("/js/<path:filename>")
def js(filename):
    return send_from_directory(os.path.join(ROOT_DIR, "js"), filename)

@app.route("/assets/<path:filename>")
def assets(filename):
    return send_from_directory(os.path.join(ROOT_DIR, "assets"), filename)



# -------------------------------
# Pages
# -------------------------------
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route("/live_map")
def live_map():
    return render_template("live_map.html")



from flask import jsonify
import random
@app.route("/api/bus-location")
def api_bus_location():
    # 1. First, create the connection
    conn = get_db_connection()
    # 2. Then, create the cursor
    cursor = conn.cursor(dictionary=True)

    # 3. NOW you can use cursor.execute (Indented inside the function!)
    cursor.execute("""
        SELECT bus_id, bus_number, route,
               start_point, destination AS end_point,
               start_time, arrival_time,
               live_location
        FROM bus_details
    """)

    buses = cursor.fetchall()

    for bus in buses:
        bus["start_time"] = str(bus["start_time"]) if bus["start_time"] else "N/A"
        bus["arrival_time"] = str(bus["arrival_time"]) if bus["arrival_time"] else "N/A"

        if bus["live_location"]:
            try:
                lat, lng = bus["live_location"].split(",")
                bus["lat"] = float(lat)
                bus["lng"] = float(lng)
            except:
                bus["lat"], bus["lng"] = None, None
        else:
            bus["lat"], bus["lng"] = None, None

        if "live_location" in bus:
            del bus["live_location"]

    cursor.close()
    conn.close()

    return jsonify({"buses": buses})

# -------------------------------
# Register API
# -------------------------------
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify(success=False, message="No data sent"), 400

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify(success=False, message="All fields required"), 400

    db = get_db_connection()
    cursor = db.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (username, email, password) VALUES (%s,%s,%s)",
            (username, email, hash_password(password))
        )
        db.commit()
        return jsonify(success=True)
    except Exception as e:
        print(f"REGISTRATION ERROR: {e}") # This will show the error in Render Logs
        return jsonify(success=False, message=str(e)), 500
    finally:
        cursor.close()
        db.close()

# -------------------------------
# Login API
# -------------------------------
@app.route("/api/login", methods=["POST"])
def login():
    print("LOGIN API HIT")

    try:
        data = request.get_json(force=True)
        print("DATA:", data)
    except Exception as e:
        print("JSON ERROR:", e)
        return jsonify(success=False, message="Invalid JSON"), 400

    email = data.get("email")
    password = data.get("password")

    print("EMAIL:", email)

    db = get_db_connection()
    print("DB CONNECTED")

    cursor = db.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM users WHERE email=%s AND password=%s",
        (email, hash_password(password))
    )

    user = cursor.fetchone()
    print("USER:", user)

    cursor.close()
    db.close()

    if user:
        return jsonify(success=True)
    else:
        return jsonify(success=False, message="Invalid credentials"), 401



@app.route("/api/test-db")
def test_db():
    try:
        db = get_db_connection()
        db.close()
        return "DB OK"
    except Exception as e:
        return str(e), 500
    

 # ✅ Add this for your location page

@app.route('/driver')
def driver():
    return render_template('driver.html')  # serves file from current directory




if __name__ == "__main__":
    port = int(os.environ.get("PORT",5000))
    app.run(host="0.0.0.0", port = port)

