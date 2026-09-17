from fastapi import APIRouter, Body, HTTPException, Depends
from sqlalchemy import select, insert
from sqlalchemy.exc import IntegrityError
from db import engine
from models import courses, course_skill_requirements, user_skills, skills, enrollments
from utils.dependencies import get_current_user
import uuid

courses_bp = APIRouter(prefix='/courses')

@courses_bp.get('/catalog')
def get_catalog(user: dict = Depends(get_current_user)):
    user_id = user['user_id']
    with engine.connect() as conn:
        all_courses = conn.execute(select(courses)).fetchall()
        
        my_skills_stmt = select(user_skills.c.skill_id, user_skills.c.proficiency_level)\
            .where(user_skills.c.user_id == user_id)
        my_skills_results = conn.execute(my_skills_stmt).fetchall()
        
        student_levels = {str(row.skill_id): row.proficiency_level for row in my_skills_results}
        
        enrolled_stmt = select(enrollments.c.course_id).where(enrollments.c.user_id == user_id)
        enrolled_result = conn.execute(enrolled_stmt).fetchall()
        enrolled_set = {str(row.course_id) for row in enrolled_result}
        
        catalog_response = []
        
        for course in all_courses:
            req_stmt = select(course_skill_requirements.c.skill_id, course_skill_requirements.c.min_level, skills.c.name)\
                .select_from(course_skill_requirements.join(skills, course_skill_requirements.c.skill_id == skills.c.id))\
                .where(course_skill_requirements.c.course_id == course.id)
            
            requirements = conn.execute(req_stmt).fetchall()
            
            total_gaps = 0
            total_required_levels = 0
            missing_skills = []
            all_requirements = []
            
            for req in requirements:
                required_level = req.min_level
                total_required_levels += required_level
                all_requirements.append(req.name)
                
                current_level = student_levels.get(str(req.skill_id), 0)
                
                if current_level < required_level:
                    gap = required_level - current_level
                    total_gaps += gap
                    missing_skills.append({
                        "skill": req.name,
                        "needed": f"+{gap} levels"
                    })
                    
            if total_required_levels == 0:
                match_percentage = 100 
            else:
                raw_score = 100 - ((total_gaps / total_required_levels) * 100)
                match_percentage = max(0, round(raw_score)) 
                
            catalog_response.append({
                "course_id": str(course.id),
                "title": course.title,
                "description": course.description,
                "match_percentage": f"{match_percentage}%",
                "missing_skills": missing_skills,
                "all_requirements": all_requirements,
                "is_enrolled": str(course.id) in enrolled_set
            })
            
    return {"catalog": catalog_response}

@courses_bp.post('/{course_id}/enroll', status_code=201)
def enroll_course(course_id: uuid.UUID, user: dict = Depends(get_current_user)):
    user_id = user['user_id']
    with engine.connect() as conn:
        try:
            stmt = insert(enrollments).values(user_id=user_id, course_id=str(course_id))
            conn.execute(stmt)
            conn.commit()
            return {"message": "Successfully enrolled"}
        except IntegrityError:
            raise HTTPException(status_code=400, detail="Already enrolled or course doesn't exist")

@courses_bp.get('/enrolled')
def get_enrolled_courses(user: dict = Depends(get_current_user)):
    user_id = user['user_id']
    with engine.connect() as conn:
        stmt = select(courses.c.id, courses.c.title, courses.c.description)\
            .select_from(enrollments.join(courses, enrollments.c.course_id == courses.c.id))\
            .where(enrollments.c.user_id == user_id)
        result = conn.execute(stmt).fetchall()
        
        enrolled_list = []
        for row in result:
            enrolled_list.append({
                "course_id": str(row.id),
                "title": row.title,
                "description": row.description
            })
            
    return {"enrolled": enrolled_list}