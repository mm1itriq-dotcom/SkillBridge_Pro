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
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'student')
    
    if not username:
        return jsonify({"error": "Username is required"}), 400
        
    if not username[0].isalpha():
        return jsonify({"error": "Username must start with a letter"}), 400

    # Validation using Regex
    if not email or not EMAIL_REGEX.match(email):
        return jsonify({"error": "Invalid email format"}), 400
        
    if not password or not PASSWORD_REGEX.match(password):
        return jsonify({"error": "Password must be at least 8 characters long and contain both letters and numbers."}), 400
        
    hashed_password = generate_password_hash(password)
    
    try:
        with engine.connect() as conn:
            stmt = insert(users).values(username=username, email=email, password_hash=hashed_password, role=role)
            conn.execute(stmt)
            conn.commit()
        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        return jsonify({"error": "Email already exists ."}), 400

from utils.decorators import login_required

@auth_bp.route('/update_profile', methods=['PUT'])
@login_required
def update_profile():
    data = request.json
    username = data.get('username')
    new_password = data.get('new_password')
    old_password = data.get('old_password')
    
    if username and not username[0].isalpha():
        return jsonify({"error": "Username must start with a letter"}), 400
        
    update_data = {}
    if username:
        update_data['username'] = username
        
    if new_password:
        if not old_password:
            return jsonify({"error": "You must provide your current password to set a new password."}), 400
            
        with engine.connect() as conn:
            user_record = conn.execute(select(users.c.password_hash).where(users.c.id == request.user_id)).fetchone()
            if not user_record or not check_password_hash(user_record.password_hash, old_password):
                return jsonify({"error": "Incorrect current password."}), 400

        if not PASSWORD_REGEX.match(new_password):
            return jsonify({"error": "Password must be at least 8 characters long and contain both letters and numbers."}), 400
        update_data['password_hash'] = generate_password_hash(new_password)
        
    if not update_data:
        return jsonify({"message": "Nothing to update"}), 200
        
    from sqlalchemy import update
    with engine.connect() as conn:
        stmt = update(users).where(users.c.id == request.user_id).values(**update_data)
        conn.execute(stmt)
        conn.commit()
        
    return jsonify({"message": "Profile updated successfully! If you changed your details, please log in again for changes to take effect."}), 200

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
                'username': result.username,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24) # Expires in 24 hours
            }, current_app.secret_key, algorithm="HS256")
            
            return jsonify({"message": "Login successful", "token": token}), 200
        else:
            return jsonify({"error": "Invalid email or password. Please try again."}), 401