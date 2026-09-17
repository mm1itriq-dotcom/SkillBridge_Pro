from fastapi import APIRouter, Body, HTTPException, Depends
from sqlalchemy import insert, select, update, delete
from db import engine
from models import courses, course_skill_requirements
from utils.dependencies import get_current_user, instructor_required
import uuid

instructor_bp = APIRouter(prefix='/instructor')

@instructor_bp.post('/create_course')
def create_course(data: dict = Body(...), user: dict = Depends(instructor_required)):
    title = data.get('title')
    description = data.get('description')
    skill_id = data.get('skill_id')
    min_level = data.get('min_level')
    
    if not skill_id or not min_level:
        raise HTTPException(status_code=400, detail="You must specify at least one skill requirement for the course.")
    
    with engine.connect() as conn:
        stmt = insert(courses).values(
            title=title, 
            description=description, 
            instructor_id=user['user_id']
        ).returning(courses.c.id)
        
        new_course_id = conn.execute(stmt).scalar()
        
        req_stmt = insert(course_skill_requirements).values(
            course_id=new_course_id,
            skill_id=skill_id,
            min_level=int(min_level)
        )
        conn.execute(req_stmt)
        conn.commit()
        
    return {"message": "Course created!", "course_id": str(new_course_id)}

@instructor_bp.delete('/delete_course/{course_id}')
def delete_course(course_id: uuid.UUID, user: dict = Depends(instructor_required)):
    course_id_str = str(course_id)
    with engine.connect() as conn:
        stmt = select(courses.c.instructor_id).where(courses.c.id == course_id_str)
        result = conn.execute(stmt).fetchone()
        
        if not result or str(result.instructor_id) != user['user_id']:
            raise HTTPException(status_code=403, detail="Course not found or you don't have permission to delete it.")
            
        del_stmt = delete(courses).where(courses.c.id == course_id_str)
        conn.execute(del_stmt)
        conn.commit()
        
    return {"message": "Course deleted successfully!"}

@instructor_bp.post('/assign_requirement')
def assign_requirement(data: dict = Body(...), user: dict = Depends(instructor_required)):
    course_id = data.get('course_id')
    skill_id = data.get('skill_id')
    min_level = data.get('min_level')
    
    with engine.connect() as conn:
        stmt = insert(course_skill_requirements).values(
            course_id=course_id,
            skill_id=skill_id,
            min_level=min_level
        )
        conn.execute(stmt)
        conn.commit()
        
    return {"message": "Skill requirement added to course!"}

@instructor_bp.put('/edit_course/{course_id}')
def edit_course(course_id: uuid.UUID, data: dict = Body(...), user: dict = Depends(instructor_required)):
    course_id_str = str(course_id)
    title = data.get('title')
    description = data.get('description')
    
    with engine.connect() as conn:
        stmt = update(courses).where(
            (courses.c.id == course_id_str) & (courses.c.instructor_id == user['user_id'])
        ).values(
            title=title,
            description=description
        )
        result = conn.execute(stmt)
        conn.commit()
        
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Course not found or unauthorized")
            
    return {"message": "Course updated successfully!"}

@instructor_bp.get('/my_courses')
def my_courses(user: dict = Depends(instructor_required)):
    with engine.connect() as conn:
        stmt = select(courses.c.id, courses.c.title, courses.c.description, courses.c.created_at)\
            .where(courses.c.instructor_id == user['user_id'])
        results = conn.execute(stmt).fetchall()
        
        my_courses_list = [{
            "course_id": str(row.id), 
            "title": row.title, 
            "description": row.description,
            "created_at": row.created_at.isoformat()
        } for row in results]
        
    return {"courses": my_courses_list}