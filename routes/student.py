from fastapi import APIRouter, Body, HTTPException, Depends
from sqlalchemy import insert, select, update, delete
from db import engine
from models import user_skills, skill_history, skills
from utils.dependencies import get_current_user
import uuid

student_bp = APIRouter(prefix='/student')

@student_bp.get('/skills')
def get_my_skills(user: dict = Depends(get_current_user)):
    user_id = user['user_id']
    with engine.connect() as conn:
        stmt = select(skills.c.id, skills.c.name, user_skills.c.proficiency_level)\
            .select_from(user_skills.join(skills, user_skills.c.skill_id == skills.c.id))\
            .where(user_skills.c.user_id == user_id)
        
        results = conn.execute(stmt).fetchall()
        
        my_skills = [{"skill_id": str(row.id), "skill": row.name, "level": row.proficiency_level} for row in results]
        return {"my_skills": my_skills}

@student_bp.get('/all_skills')
def get_all_skills(user: dict = Depends(get_current_user)):
    with engine.connect() as conn:
        stmt = select(skills.c.id, skills.c.name, skills.c.category)
        results = conn.execute(stmt).fetchall()
        
        all_skills = [{"skill_id": str(row.id), "name": row.name, "category": row.category} for row in results]
        return {"skills": all_skills}

@student_bp.post('/update_skill')
def update_skill(data: dict = Body(...), user: dict = Depends(get_current_user)):
    user_id = user['user_id']
    skill_id = data.get('skill_id')
    new_level = data.get('new_level')
    
    with engine.connect() as conn:
        stmt = select(user_skills.c.proficiency_level)\
            .where(user_skills.c.user_id == user_id)\
            .where(user_skills.c.skill_id == skill_id)
        existing_record = conn.execute(stmt).fetchone()
        
        previous_level = existing_record.proficiency_level if existing_record else None
        
        if existing_record:
            update_stmt = update(user_skills)\
                .where(user_skills.c.user_id == user_id)\
                .where(user_skills.c.skill_id == skill_id)\
                .values(proficiency_level=new_level)
            conn.execute(update_stmt)
        else:
            insert_stmt = insert(user_skills).values(
                user_id=user_id, 
                skill_id=skill_id, 
                proficiency_level=new_level
            )
            conn.execute(insert_stmt)
            
        history_stmt = insert(skill_history).values(
            user_id=user_id,
            skill_id=skill_id,
            previous_level=previous_level,
            new_level=new_level
        )
        conn.execute(history_stmt)
        conn.commit()
        
    return {"message": "Skill updated and logged successfully!"}


@student_bp.delete('/skill/{skill_id}')
def delete_skill(skill_id: uuid.UUID, user: dict = Depends(get_current_user)):
    user_id = user['user_id']
    skill_id_str = str(skill_id)
    with engine.connect() as conn:
        stmt = select(user_skills.c.proficiency_level)\
            .where(user_skills.c.user_id == user_id)\
            .where(user_skills.c.skill_id == skill_id_str)
        existing_record = conn.execute(stmt).fetchone()
        
        if not existing_record:
            raise HTTPException(status_code=404, detail="Skill not found in your profile")
            
        previous_level = existing_record.proficiency_level
        
        del_stmt = delete(user_skills)\
            .where(user_skills.c.user_id == user_id)\
            .where(user_skills.c.skill_id == skill_id_str)
        conn.execute(del_stmt)
        
        history_stmt = insert(skill_history).values(
            user_id=user_id,
            skill_id=skill_id_str,
            previous_level=previous_level,
            new_level=0 
        )
        conn.execute(history_stmt)
        conn.commit()
        
    return {"message": "Skill deleted successfully!"}