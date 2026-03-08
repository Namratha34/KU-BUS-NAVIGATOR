from flask import Flask, render_template, jsonify, request, send_from_directory
from flask_cors import CORS
from backend.db import get_db_connection
import hashlib
import os
import mysql.connector

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))

app = Flask(__name__, template_folder=os.path.join(ROOT_DIR, "templates"))
CORS(app)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Static File Routes
@app.route("/css/<path:filename>")
def css(filename):
    return send_from_directory(os.path.join(ROOT_DIR, "css"), filename)

@app.route("/js/<path:filename>")
def js(filename):
    return send_from_directory(os.path.join(ROOT_DIR, "js"), filename)

@app.route("/assets/<path:filename>")
def assets(filename):
    return send_from_directory(os.path.join(ROOT_DIR, "assets"), filename)

# Page Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route("/live_map")
def live_map():
    return render_template("live_map.html")

@app.route('/driver')
def driver():
    return render_template('driver.html')

# === API ROUTES ===

@app.route("/api/bus-location")
def api_bus_location():
    conn = None
    try:
        conn = get_db_connection()
        # Use buffered=True here as well
        cursor = conn.cursor(dictionary=True, buffered=True)
        cursor.execute("SELECT bus_id, bus_number, route, start_point, destination AS end_point, start_time, arrival_time, live_location FROM bus_details")
        buses = cursor.fetchall()
        cursor.close()
        
        # ... keep your existing loop to format the buses list ...
        
        return jsonify({"buses": buses})
    finally:
        if conn and conn.is_connected():
            conn.close()
@app.route("/api/bus/<int:bus_id>")
def get_bus(bus_id):
    conn = None
    try:
        conn = get_db_connection()
        # Adding buffered=True is the fix for "Unread result found"
        cursor = conn.cursor(dictionary=True, buffered=True)
        
        bus_name = f"Bus{bus_id}"
        cursor.execute("SELECT * FROM bus_details WHERE bus_number = %s", (bus_name,))
        bus = cursor.fetchone()
        
        cursor.close()
        
        if not bus:
            return jsonify({"success": False, "message": "Bus not found"}), 404

        # Convert time objects to strings for JSON
        bus["start_time"] = str(bus["start_time"]) if bus.get("start_time") else "N/A"
        bus["arrival_time"] = str(bus["arrival_time"]) if bus.get("arrival_time") else "N/A"
        
        return jsonify({"success": True, "data": bus})

    except Exception as e:
        print(f"DATABASE ERROR: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email=%s AND password=%s", (data.get("email"), hash_password(data.get("password"))))
    user = cursor.fetchone()
    cursor.close()
    db.close()
    return jsonify(success=True) if user else jsonify(success=False), 401

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)