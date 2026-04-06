from flask import Blueprint, request, jsonify
import logging
from backend.app.core.security import require_auth
from backend.app.services.forecast_service import generate_multivariate_forecast

log = logging.getLogger(__name__)
forecast_bp = Blueprint('forecast', __name__)


@forecast_bp.get('/forecast')
@require_auth
def get_forecast():
    domain = request.args.get('domain', 'CP01').upper()
    months_str = request.args.get('months', 6)

    try:
        months = int(months_str)
    except ValueError:
        months = 6

    log.info("Received forecast request for domain: %s, months: %d", domain, months)

    try:
        forecast_result = generate_multivariate_forecast(domain_code = domain, months= months)
        return jsonify(forecast_result), 200
    
    except ValueError as ve:
        log.warning(f"Eroare de validare la prognoza pentru domeniul {domain}: {ve}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        log.error(f"Eroare la generarea prognozei pentru domeniul {domain}: {e}")
        return jsonify({"error": "A apărut o eroare la generarea prognozei."}), 500