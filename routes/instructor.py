from flask import Blueprint, request, jsonify
from sqlalchemy import insert
from db import engine
from models import courses, course_skill_requirements
from utils.decorators import login_required, instructor_required

instructor_bp = Blueprint('instructor', __name__, url_prefix='/instructor')

@instructor_bp.route('/create_course', methods=['POST'])
@login_required
@instructor_required # Double protection!
def create_course():
    data = request.json
    title = data.get('title')
    description = data.get('description')
    
    with engine.connect() as conn:
        # Create the course
        stmt = insert(courses).values(
            title=title, 
            description=description, 
            instructor_id=request.user_id
        ).returning(courses.c.id) # Returns the newly generated UUID
        
        new_course_id = conn.execute(stmt).scalar()
        conn.commit()
        
    return jsonify({"message": "Course created!", "course_id": str(new_course_id)})

@instructor_bp.route('/assign_requirement', methods=['POST'])
@login_required
@instructor_required
def assign_requirement():
    data = request.json
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
        
    return jsonify({"message": "Skill requirement added to course!"})