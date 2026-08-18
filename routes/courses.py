from flask import Blueprint, request, jsonify
from sqlalchemy import select, insert
from sqlalchemy.exc import IntegrityError
from db import engine
from models import courses, course_skill_requirements, user_skills, skills, enrollments
from utils.decorators import login_required

courses_bp = Blueprint('courses', __name__, url_prefix='/courses')

@courses_bp.route('/catalog', methods=['GET'])
@login_required
def get_catalog():
    with engine.connect() as conn:
        # 1. Get all courses
        all_courses = conn.execute(select(courses)).fetchall()
        
        # 2. Get the logged-in student's current skills
        my_skills_stmt = select(user_skills.c.skill_id, user_skills.c.proficiency_level)\
            .where(user_skills.c.user_id == request.user_id)
        my_skills_results = conn.execute(my_skills_stmt).fetchall()
        
        # Convert to a dictionary: { skill_id: level } for ultra-fast lookups
        student_levels = {str(row.skill_id): row.proficiency_level for row in my_skills_results}
        
        # 3. Get student's enrolled courses
        enrolled_stmt = select(enrollments.c.course_id).where(enrollments.c.user_id == request.user_id)
        enrolled_result = conn.execute(enrolled_stmt).fetchall()
        enrolled_set = {str(row.course_id) for row in enrolled_result}
        
        catalog_response = []
        
        # 4. Algorithm: Evaluate every course against the student's profile
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
            
    return jsonify({"catalog": catalog_response})

@courses_bp.route('/<uuid:course_id>/enroll', methods=['POST'])
@login_required
def enroll_course(course_id):
    with engine.connect() as conn:
        try:
            stmt = insert(enrollments).values(user_id=request.user_id, course_id=str(course_id))
            conn.execute(stmt)
            conn.commit()
            return jsonify({"message": "Successfully enrolled"}), 201
        except IntegrityError:
            return jsonify({"error": "Already enrolled or course doesn't exist"}), 400

@courses_bp.route('/enrolled', methods=['GET'])
@login_required
def get_enrolled_courses():
    with engine.connect() as conn:
        stmt = select(courses.c.id, courses.c.title, courses.c.description)\
            .select_from(enrollments.join(courses, enrollments.c.course_id == courses.c.id))\
            .where(enrollments.c.user_id == request.user_id)
        result = conn.execute(stmt).fetchall()
        
        enrolled_list = []
        for row in result:
            enrolled_list.append({
                "course_id": str(row.id),
                "title": row.title,
                "description": row.description
            })
            
    return jsonify({"enrolled": enrolled_list}), 200