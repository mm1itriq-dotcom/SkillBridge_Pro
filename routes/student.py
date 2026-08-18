from flask import Blueprint, request, jsonify
from sqlalchemy import insert, select, update
from db import engine
from models import user_skills, skill_history, skills
from utils.decorators import login_required

student_bp = Blueprint('student', __name__, url_prefix='/student')

@student_bp.route('/skills', methods=['GET'])
@login_required
def get_my_skills():
    # Fetch all skills the logged-in student has rated
    with engine.connect() as conn:
        stmt = select(skills.c.name, user_skills.c.proficiency_level)\
            .select_from(user_skills.join(skills, user_skills.c.skill_id == skills.c.id))\
            .where(user_skills.c.user_id == request.user_id)
        
        results = conn.execute(stmt).fetchall()
        
        my_skills = [{"skill": row.name, "level": row.proficiency_level} for row in results]
        return jsonify({"my_skills": my_skills})

@student_bp.route('/update_skill', methods=['POST'])
@login_required
def update_skill():
    data = request.json
    skill_id = data.get('skill_id') # UUID of the skill
    new_level = data.get('new_level') # Integer 1-5
    
    with engine.connect() as conn:
        # Check if the student already rated this skill
        stmt = select(user_skills.c.proficiency_level)\
            .where(user_skills.c.user_id == request.user_id)\
            .where(user_skills.c.skill_id == skill_id)
        existing_record = conn.execute(stmt).fetchone()
        
        previous_level = existing_record.proficiency_level if existing_record else None
        
        if existing_record:
            # Update existing skill
            update_stmt = update(user_skills)\
                .where(user_skills.c.user_id == request.user_id)\
                .where(user_skills.c.skill_id == skill_id)\
                .values(proficiency_level=new_level)
            conn.execute(update_stmt)
        else:
            # Insert new skill
            insert_stmt = insert(user_skills).values(
                user_id=request.user_id, 
                skill_id=skill_id, 
                proficiency_level=new_level
            )
            conn.execute(insert_stmt)
            
        # 🌟 IMMUTABLE AUDIT LOG: Record the history of this change!
        history_stmt = insert(skill_history).values(
            user_id=request.user_id,
            skill_id=skill_id,
            previous_level=previous_level,
            new_level=new_level
        )
        conn.execute(history_stmt)
        conn.commit()
        
    return jsonify({"message": "Skill updated and logged successfully!"})