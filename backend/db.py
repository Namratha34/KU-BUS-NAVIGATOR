import os
import requests
from dotenv import load_dotenv

# ================= ENV SETUP =================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, "..", ".env")

load_dotenv(ENV_PATH)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print("DEBUG SUPABASE URL:", SUPABASE_URL)
print("DEBUG SUPABASE KEY:", "FOUND" if SUPABASE_KEY else "MISSING")

if not SUPABASE_URL:
    raise ValueError("❌ SUPABASE_URL is not set")

if not SUPABASE_KEY:
    raise ValueError("❌ SUPABASE_KEY is not set")

# ================= HEADERS =================
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}


# ================= FETCH ALL =================
def fetch_all(table):
    try:
        url = f"{SUPABASE_URL}/rest/v1/{table}"

        res = requests.get(url, headers=HEADERS)

        print("FETCH ALL STATUS:", res.status_code)
        print("FETCH ALL RESPONSE:", res.text)

        if res.status_code != 200:
            return []

        return res.json()

    except Exception as e:
        print("❌ FETCH ALL ERROR:", e)
        return []


# ================= FETCH WHERE =================
def fetch_where(table, column, value):
    try:
        value = str(value).strip()   # ✅ ONLY strip, NO lowercase

        url = f"{SUPABASE_URL}/rest/v1/{table}?{column}=eq.{value}"

        res = requests.get(url, headers=HEADERS)

        print("FETCH WHERE STATUS:", res.status_code)
        print("FETCH WHERE RESPONSE:", res.text)

        if res.status_code != 200:
            return []

        return res.json()

    except Exception as e:
        print("❌ FETCH WHERE ERROR:", e)
        return []


# ================= INSERT (FIXED & SAFE) =================
def insert_data(table, data):
    try:
        # Safe email handling
        if "email" in data and data["email"]:
            data["email"] = data["email"].lower().strip()

        url = f"{SUPABASE_URL}/rest/v1/{table}"

        headers = {
            **HEADERS,
            "Prefer": "return=representation"
        }

        res = requests.post(url, json=data, headers=headers)

        print("INSERT STATUS:", res.status_code)
        print("INSERT RESPONSE:", res.text)

        # ❌ HARD FAIL CHECK
        if res.status_code not in [200, 201]:
            print("❌ INSERT FAILED (HTTP ERROR)")
            return None

        try:
            result = res.json()
        except Exception:
            print("❌ INSERT FAILED (INVALID JSON)")
            return None

        # ❌ EMPTY RESPONSE CHECK
        if not result:
            print("❌ INSERT FAILED (EMPTY RESULT)")
            return None

        return result

    except Exception as e:
        print("❌ INSERT ERROR:", e)
        return None


# ================= UPDATE =================
def update_data(table, data, column, value):
    try:
        url = f"{SUPABASE_URL}/rest/v1/{table}?{column}=eq.{value}"

        res = requests.patch(url, json=data, headers=HEADERS)

        print("UPDATE STATUS:", res.status_code)
        print("UPDATE RESPONSE:", res.text)

        if res.status_code not in [200, 204]:
            return None

        try:
            return res.json()
        except:
            return {"success": True}

    except Exception as e:
        print("❌ UPDATE ERROR:", e)
        return None