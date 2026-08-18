import re
import jwt
import datetime
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import insert, select
from db import engine
from models import users

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# Regex Rules
EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
# Password must be at least 8 chars, contain 1 lowercase, 1 uppercase, 1 number, and 1 symbol
PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$") 

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'student')
    
    # Validation using Regex
    if not email or not EMAIL_REGEX.match(email):
        return jsonify({"error": "Invalid email format"}), 400
        
    if not password or not PASSWORD_REGEX.match(password):
        return jsonify({"error": "Password must be at least 8 characters long and contain both letters and numbers."}), 400
        
    hashed_password = generate_password_hash(password)
    
    try:
        with engine.connect() as conn:
            stmt = insert(users).values(email=email, password_hash=hashed_password, role=role)
            conn.execute(stmt)
            conn.commit()
        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        return jsonify({"error": "Email already exists or database error."}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    with engine.connect() as conn:
        stmt = select(users).where(users.c.email == email)
        result = conn.execute(stmt).fetchone()
        
        # Verify Password
        if result and check_password_hash(result.password_hash, password):
            
            # Generate the JSON Web Token
            token = jwt.encode({
                'user_id': str(result.id), # UUIDs must be cast to string for JSON serialization
                'role': result.role,
                'email': result.email,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24) # Expires in 24 hours
            }, current_app.secret_key, algorithm="HS256")
            
            return jsonify({"message": "Login successful", "token": token}), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401