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
    skill_id = data.get('skill_id')
    min_level = data.get('min_level')
    
    if not skill_id or not min_level:
        return jsonify({"error": "You must specify at least one skill requirement for the course."}), 400
    
    with engine.connect() as conn:
        # Create the course
        stmt = insert(courses).values(
            title=title, 
            description=description, 
            instructor_id=request.user_id
        ).returning(courses.c.id) # Returns the newly generated UUID
        
        new_course_id = conn.execute(stmt).scalar()
        
        # Insert the initial required skill
        req_stmt = insert(course_skill_requirements).values(
            course_id=new_course_id,
            skill_id=skill_id,
            min_level=int(min_level)
        )
        conn.execute(req_stmt)
        
        conn.commit()
        
    return jsonify({"message": "Course created!", "course_id": str(new_course_id)})

@instructor_bp.route('/delete_course/<course_id>', methods=['DELETE'])
@login_required
@instructor_required
def delete_course(course_id):
    from sqlalchemy import delete, select
    with engine.connect() as conn:
        # Verify the instructor owns this course
        stmt = select(courses.c.instructor_id).where(courses.c.id == course_id)
        result = conn.execute(stmt).fetchone()
        
        if not result or str(result.instructor_id) != request.user_id:
            return jsonify({"error": "Course not found or you don't have permission to delete it."}), 403
            
        del_stmt = delete(courses).where(courses.c.id == course_id)
        conn.execute(del_stmt)
        conn.commit()
        
    return jsonify({"message": "Course deleted successfully!"})

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

@instructor_bp.route('/edit_course/<course_id>', methods=['PUT'])
@login_required
@instructor_required
def edit_course(course_id):
    from sqlalchemy import update
    data = request.json
    title = data.get('title')
    description = data.get('description')
    
    with engine.connect() as conn:
        stmt = update(courses).where(
            (courses.c.id == course_id) & (courses.c.instructor_id == request.user_id)
        ).values(
            title=title,
            description=description
        )
        result = conn.execute(stmt)
        conn.commit()
        
        if result.rowcount == 0:
            return jsonify({"error": "Course not found or unauthorized"}), 404
            
    return jsonify({"message": "Course updated successfully!"})

@instructor_bp.route('/my_courses', methods=['GET'])
@login_required
@instructor_required
def my_courses():
    from sqlalchemy import select
    with engine.connect() as conn:
        stmt = select(courses.c.id, courses.c.title, courses.c.description, courses.c.created_at)\
            .where(courses.c.instructor_id == request.user_id)
        results = conn.execute(stmt).fetchall()
        
        my_courses_list = [{
            "course_id": str(row.id), 
            "title": row.title, 
            "description": row.description,
            "created_at": row.created_at.isoformat()
        } for row in results]
        
    return jsonify({"courses": my_courses_list})