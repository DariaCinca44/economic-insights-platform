from flask import Flask, jsonify
from flask_cors import CORS
from backend.app.db import db_ping

app= Flask(__name__)
CORS(app)

@app.get("/health")
def health():
    return jsonify({"status": "ok"})

@app.get("/db-status")
def db_status():
    db_ping()
    return jsonify({"db": "ok"})

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=8000)