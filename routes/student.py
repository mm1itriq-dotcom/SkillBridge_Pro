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
        stmt = select(skills.c.id, skills.c.name, user_skills.c.proficiency_level)\
            .select_from(user_skills.join(skills, user_skills.c.skill_id == skills.c.id))\
            .where(user_skills.c.user_id == request.user_id)
        
        results = conn.execute(stmt).fetchall()
        
        my_skills = [{"skill_id": str(row.id), "skill": row.name, "level": row.proficiency_level} for row in results]
        return jsonify({"my_skills": my_skills})

@student_bp.route('/all_skills', methods=['GET'])
@login_required
def get_all_skills():
    with engine.connect() as conn:
        stmt = select(skills.c.id, skills.c.name, skills.c.category)
        results = conn.execute(stmt).fetchall()
        
        all_skills = [{"skill_id": str(row.id), "name": row.name, "category": row.category} for row in results]
        return jsonify({"skills": all_skills})

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

@student_bp.route('/skill/<uuid:skill_id>', methods=['DELETE'])
@login_required
def delete_skill(skill_id):
    from sqlalchemy import delete
    
    with engine.connect() as conn:
        # Check if the skill exists to get previous level for history
        stmt = select(user_skills.c.proficiency_level)\
            .where(user_skills.c.user_id == request.user_id)\
            .where(user_skills.c.skill_id == str(skill_id))
        existing_record = conn.execute(stmt).fetchone()
        
        if not existing_record:
            return jsonify({"error": "Skill not found in your profile"}), 404
            
        previous_level = existing_record.proficiency_level
        
        # Delete from user_skills
        del_stmt = delete(user_skills)\
            .where(user_skills.c.user_id == request.user_id)\
            .where(user_skills.c.skill_id == str(skill_id))
        conn.execute(del_stmt)
        
        # Log deletion in history (new_level = None/0 indicates deletion)
        history_stmt = insert(skill_history).values(
            user_id=request.user_id,
            skill_id=str(skill_id),
            previous_level=previous_level,
            new_level=0 
        )
        conn.execute(history_stmt)
        conn.commit()
        
    return jsonify({"message": "Skill deleted successfully!"})