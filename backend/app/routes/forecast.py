from flask import Blueprint, request, jsonify

from backend.app.core.config import DOMAIN_CONFIG
from backend.app.core.db import get_session
from backend.app.core.security import require_auth
from backend.app.services.forecast_service import generate_forecast, get_ai_insight
from backend.app.services.series_cache import get_series_by_key

forecast_bp= Blueprint('forecast', __name__)

@forecast_bp.get('/forecast')
@require_auth
def get_forecast():
    domain= request.args.get('domain', 'food')
    type_ = request.args.get('type', 'inflation')
    months= int(request.args.get('months',6))

    if domain not in DOMAIN_CONFIG:
        return jsonify({'error': 'Invalid domain'}), 400

    config= DOMAIN_CONFIG[domain][type_]
    cache_key= f'eurostat:{config['dataset']}:{config['key']}'

    with get_session() as session:
        series= get_series_by_key(cache_key)

        if not series:
            return jsonify({'error': 'Data not found. Visit dashboard first'})

        points = generate_forecast(series.id, session, months)

        if not points:
            return jsonify({'error': 'Date insuficiente pentru prognoza'}), 400

        history = [p for p in points if not p['is_forecast']]
        forecast = [p for p in points if p['is_forecast']]

        explanation = get_ai_insight(config['title'], history, forecast)

        data= generate_forecast(series.id, session, months)
        return jsonify({'title': config['title'], 'points': data, 'explanation': explanation})