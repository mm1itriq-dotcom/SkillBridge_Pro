import logging
import traceback
from flask import jsonify
from logging.handlers import RotatingFileHandler

def setup_error_handlers(app):
    # 1. Configure the Logger to write to a file
    # This keeps the file from getting too big (max 1MB, keeps 5 backups)
    file_handler = RotatingFileHandler('logs/app_errors.log', maxBytes=1024000, backupCount=5)
    
    # Format the log message: [Time] ERROR in [File]: [Message]
    formatter = logging.Formatter('[%(asctime)s] ERROR in %(module)s: %(message)s')
    file_handler.setFormatter(formatter)
    
    # Attach it to the Flask app logger
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.ERROR)

    # 2. Global Exception Catcher
    @app.errorhandler(Exception)
    def handle_exception(e):
        # Pass through HTTP errors (like 404 Not Found)
        if hasattr(e, 'code') and getattr(e, 'code') != 500:
            return jsonify({"error": str(e)}), e.code
            
        # Get the full red error text you usually see in the terminal
        error_traceback = traceback.format_exc()
        
        # Write it to our logs/app_errors.log file!
        app.logger.error(f"Unhandled Exception: {str(e)}\n{error_traceback}")
        
        # Return a safe, clean message to the user/frontend instead of crashing the server
        return jsonify({
            "error": "An unexpected server error occurred.",
            "details": str(e) # You can remove this line in Production for extra security
        }), 500