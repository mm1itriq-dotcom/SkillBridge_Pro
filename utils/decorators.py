import jwt
from functools import wraps
from flask import request, jsonify, current_app

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # The token is usually passed in the Authorization header
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing! Please log in.'}), 401
        
        try:
            # Format is usually "Bearer <token>"
            if token.startswith('Bearer '):
                token = token.split(' ')[1]
                
            # Decode the token using our secret key
            data = jwt.decode(token, current_app.secret_key, algorithms=["HS256"])
            
            # Store the decoded user data in the request context for the route to use
            request.user_id = data['user_id']
            request.user_role = data['role']
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired! Please log in again.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token is invalid!'}), 401
            
        return f(*args, **kwargs)
    return decorated_function

def instructor_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if getattr(request, 'user_role', None) != 'instructor':
            return jsonify({"error": "Unauthorized: Instructors only."}), 403
        return f(*args, **kwargs)
    return decorated_function