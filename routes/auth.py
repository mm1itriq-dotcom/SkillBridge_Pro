import re
import jwt
import datetime
from fastapi import APIRouter, Body, HTTPException, Depends
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import insert, select, update
from db import engine
from models import users, user_skills, skill_history, skills
from utils.dependencies import get_current_user, SECRET_KEY

auth_bp = APIRouter(prefix='/auth')

@auth_bp.get('/skills')
def get_public_skills():
    with engine.connect() as conn:
        stmt = select(skills.c.id, skills.c.name, skills.c.category)
        results = conn.execute(stmt).fetchall()
        return [{"skill_id": str(row.id), "name": row.name, "category": row.category} for row in results]


EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$") 

@auth_bp.post('/register', status_code=201)
def register(data: dict = Body(...)):
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'student')
    skills_data = data.get('skills', []) # Array of objects: [{"skill_id": "...", "level": 3}, ...]
    
    if not username:
        raise HTTPException(status_code=400, detail="Username is required")
        
    if not username[0].isalpha():
        raise HTTPException(status_code=400, detail="Username must start with a letter")

    if not email or not EMAIL_REGEX.match(email):
        raise HTTPException(status_code=400, detail="Invalid email format")
        
    if not password or not PASSWORD_REGEX.match(password):
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long and contain both letters and numbers.")
        
    hashed_password = generate_password_hash(password)
    
    try:
        with engine.connect() as conn:
            # 1. Insert the user and get their generated UUID
            stmt = insert(users).values(
                username=username, 
                email=email, 
                password_hash=hashed_password, 
                role=role
            ).returning(users.c.id)
            
            new_user_id = conn.execute(stmt).scalar()
            
            # 2. If skills were provided, insert them immediately!
            if role == 'student' and skills_data:
                for skill in skills_data:
                    skill_id = skill.get('skill_id')
                    skill_name = skill.get('skill_name')
                    level = skill.get('level')
                    
                    final_skill_id = skill_id
                    
                    # If it's a custom skill
                    if skill_id == 'other' and skill_name:
                        # Check if it already exists by name
                        existing = conn.execute(select(skills.c.id).where(skills.c.name.ilike(skill_name))).fetchone()
                        if existing:
                            final_skill_id = existing.id
                        else:
                            import uuid
                            new_id = uuid.uuid4()
                            conn.execute(insert(skills).values(id=new_id, name=skill_name, category="Custom"))
                            final_skill_id = new_id
                    
                    if final_skill_id and level:
                        conn.execute(insert(user_skills).values(
                            user_id=new_user_id,
                            skill_id=final_skill_id,
                            proficiency_level=level
                        ))
                        # Keep the audit history accurate
                        conn.execute(insert(skill_history).values(
                            user_id=new_user_id,
                            skill_id=final_skill_id,
                            previous_level=None,
                            new_level=level
                        ))
            
            conn.commit()
        return {"message": "User registered successfully with skills!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Email already exists.")

@auth_bp.put('/update_profile')
def update_profile(data: dict = Body(...), user: dict = Depends(get_current_user)):
    user_id = user['user_id']
    username = data.get('username')
    new_password = data.get('new_password')
    old_password = data.get('old_password')
    
    if username and not username[0].isalpha():
        raise HTTPException(status_code=400, detail="Username must start with a letter")
        
    update_data = {}
    if username:
        update_data['username'] = username
        
    if new_password:
        if not old_password:
            raise HTTPException(status_code=400, detail="You must provide your current password to set a new password.")
            
        with engine.connect() as conn:
            user_record = conn.execute(select(users.c.password_hash).where(users.c.id == user_id)).fetchone()
            if not user_record or not check_password_hash(user_record.password_hash, old_password):
                raise HTTPException(status_code=400, detail="Incorrect current password.")

        if not PASSWORD_REGEX.match(new_password):
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters long and contain both letters and numbers.")
        update_data['password_hash'] = generate_password_hash(new_password)
        
    if not update_data:
        return {"message": "Nothing to update"}
        
    with engine.connect() as conn:
        stmt = update(users).where(users.c.id == user_id).values(**update_data)
        conn.execute(stmt)
        conn.commit()
        
    return {"message": "Profile updated successfully! If you changed your details, please log in again for changes to take effect."}

@auth_bp.post('/login')
def login(data: dict = Body(...)):
    email = data.get('email')
    password = data.get('password')
    
    with engine.connect() as conn:
        stmt = select(users).where(users.c.email == email)
        result = conn.execute(stmt).fetchone()
        
        if result and check_password_hash(result.password_hash, password):
            token = jwt.encode({
                'user_id': str(result.id),
                'role': result.role,
                'email': result.email,
                'username': result.username,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, SECRET_KEY, algorithm="HS256")
            
            return {"message": "Login successful", "token": token}
        else:
            raise HTTPException(status_code=401, detail="Invalid email or password. Please try again.")