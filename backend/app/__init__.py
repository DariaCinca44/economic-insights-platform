from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from backend.app.routes.dashboard import dashboard_bp
from backend.app.routes.eurostat import eurostat_bp
from backend.app.routes.auth import auth_bp
from backend.app.core.db import db_ping

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(dashboard_bp, url_prefix='/api')
    app.register_blueprint(eurostat_bp, url_prefix='/api/eurostat')
    app.register_blueprint(auth_bp, url_prefix= '/api/auth')

    @app.errorhandler(HTTPException)
    def handler_http_exception(e: HTTPException):
        return jsonify({
            "error": e.name,
            "message": e.description,
            "status": e.code
        }), e.code

    @app.errorhandler(Exception)
    def handler_unexpected_exception(e: Exception):
        return jsonify({
            "error": "Internal Server Error",
            "message": str(e),
            "status": 500
        }), 500

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    @app.get("/db-status")
    def db_status():
        db_ping()
        return jsonify({"db": "ok"})

    return app