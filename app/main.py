from flask import Flask, jsonify
from sqlalchemy import text
from .db import SessionLocal

app = Flask(__name__)


@app.get("/health/liveness")
def liveness():
    return jsonify({"status": "ok"}), 200


@app.get("/health/readiness")
def readiness():
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        return jsonify({"status": "ready"}), 200
    finally:
        db.close()

