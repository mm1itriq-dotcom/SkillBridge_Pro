import logging
import traceback
from fastapi import Request
from fastapi.responses import JSONResponse
from logging.handlers import RotatingFileHandler

def setup_error_handlers(app):
    logger = logging.getLogger("app_logger")
    logger.setLevel(logging.ERROR)
    
    import os
    if not os.path.exists('logs'):
        os.makedirs('logs')
        
    file_handler = RotatingFileHandler('logs/app_errors.log', maxBytes=1024000, backupCount=5)
    formatter = logging.Formatter('[%(asctime)s] ERROR: %(message)s')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        error_traceback = traceback.format_exc()
        logger.error(f"Unhandled Exception: {str(exc)}\n{error_traceback}")
        
        return JSONResponse(
            status_code=500,
            content={
                "error": "An unexpected server error occurred.",
                "details": str(exc)
            }
        )