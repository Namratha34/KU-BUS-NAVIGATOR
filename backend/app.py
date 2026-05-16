from flask import Flask, render_template, jsonify, request, send_from_directory
from flask_cors import CORS
from backend.db import fetch_all, fetch_where, insert_data, update_data
from dotenv import load_dotenv
import hashlib
import os

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))

app = Flask(__name__, template_folder=os.path.join(ROOT_DIR, "templates"))
CORS(app)


# ================= PASSWORD =================
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


# ================= STATIC =================
@app.route("/css/<path:filename>")
def css(filename):
    return send_from_directory(os.path.join(ROOT_DIR, "css"), filename)


@app.route("/js/<path:filename>")
def js(filename):
    return send_from_directory(os.path.join(ROOT_DIR, "js"), filename)


@app.route("/assets/<path:filename>")
def assets(filename):
    return send_from_directory(os.path.join(ROOT_DIR, "assets"), filename)


# ================= PAGES =================
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')


@app.route('/live_map')
def live_map():
    return render_template('live_map.html')


@app.route('/driver')
def driver():
    return render_template('driver.html')


# ================= DEBUG =================
@app.route("/test-db")
def test_db():
    return jsonify(fetch_all("users"))


# ================= API =================

# ✅ GET ALL BUSES
@app.route("/api/bus-location")
def bus_location():
    try:
        buses = fetch_all("bus_details")
        return jsonify({"buses": buses})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ✅ GET SINGLE BUS
@app.route("/api/bus/<int:bus_id>")
def get_bus(bus_id):
    try:
        bus_name = f"Bus{bus_id}"
        rows = fetch_where("bus_details", "bus_number", bus_name)

        if not rows:
            return jsonify({"success": False}), 404

        return jsonify({"success": True, "data": rows[0]})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# ✅ LOGIN
@app.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        email = data.get("email").lower().strip()
        password = hash_password(data.get("password"))

        rows = fetch_where("users", "email", email)

        print("LOGIN DATA:", rows)

        if not rows:
            return jsonify({"success": False, "message": "User not found"}), 404

        user = rows[0]

        if user["password"] == password:
            return jsonify({
                "success": True,
                "username": user["username"]
            })
        else:
            return jsonify({"success": False, "message": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/api/register", methods=["POST"])
def register():
    try:
        data = request.get_json()

        username = data.get("username")
        email = data.get("email").lower().strip()
        password = data.get("password")

        if not username or not email or not password:
            return jsonify({"success": False, "message": "Missing fields"}), 400

        result = insert_data("users", {
            "username": username,
            "email": email,
            "password": hash_password(password)
        })

        print("REGISTER RESULT:", result)

        # 🔴 IMPORTANT CHECK
        if not result:
            return jsonify({
                "success": False,
                "message": "Insert failed (no result returned)"
            }), 500

        return jsonify({
            "success": True,
            "message": "User registered successfully"
        })

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# ✅ UPDATE LOCATION
@app.route("/api/update-location", methods=["POST"])
def update_location():
    try:
        data = request.get_json()

        print("LOCATION UPDATE RECEIVED:", data)

        bus_name = f"Bus{data.get('bus_id')}".strip()

        print("UPDATING BUS:", bus_name)

        result = update_data(
            "bus_details",
            {
                "latitude": float(data.get("lat")),
                "longitude": float(data.get("lng"))
            },
            "bus_number",
            bus_name
        )

        print("UPDATE RESULT:", result)
        
        return jsonify({"success": True})

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"success": False}), 500
@app.route("/api/get_live_location")
def get_live_location():
    try:
        bus_id = request.args.get("bus_id")
        bus_name = f"Bus{bus_id}"

        rows = fetch_where("bus_details", "bus_number", bus_name)

        if not rows:
            return jsonify({"success": False}), 404

        return jsonify({
            "success": True,
            "buses": rows
        })

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
# ================= RUN =================
if __name__ == "__main__":
    app.run()