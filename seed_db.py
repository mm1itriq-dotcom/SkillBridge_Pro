from db import engine
from models import users, skills, courses, course_skill_requirements
from sqlalchemy import insert
from werkzeug.security import generate_password_hash
import uuid

def seed():
    with engine.connect() as conn:
        # Create an instructor
        instructor_id = uuid.uuid4()
        conn.execute(insert(users).values(
            id=instructor_id,
            email="instructor@expert.com",
            password_hash=generate_password_hash("password123!"),
            role="instructor"
        ))

        # Create skills
        python_id = uuid.uuid4()
        sql_id = uuid.uuid4()
        react_id = uuid.uuid4()
        math_id = uuid.uuid4()
        
        conn.execute(insert(skills).values([
            {"id": python_id, "name": "Python Programming", "category": "Programming"},
            {"id": sql_id, "name": "Database Design (SQL)", "category": "Data"},
            {"id": react_id, "name": "React Frontend", "category": "Web Dev"},
            {"id": math_id, "name": "Linear Algebra", "category": "Math"}
        ]))

        # Create courses
        course1_id = uuid.uuid4()
        course2_id = uuid.uuid4()
        
        conn.execute(insert(courses).values([
            {
                "id": course1_id,
                "title": "Advanced Data Science Bootcamp",
                "description": "Master machine learning models and big data processing.",
                "instructor_id": instructor_id
            },
            {
                "id": course2_id,
                "title": "Full Stack Web Mastery",
                "description": "Build production ready React applications with a Python backend.",
                "instructor_id": instructor_id
            }
        ]))

        # Create requirements
        conn.execute(insert(course_skill_requirements).values([
            # Data Science needs Python (3) and Math (4)
            {"course_id": course1_id, "skill_id": python_id, "min_level": 3},
            {"course_id": course1_id, "skill_id": math_id, "min_level": 4},
            
            # Web Mastery needs React (3), Python (2), SQL (2)
            {"course_id": course2_id, "skill_id": react_id, "min_level": 3},
            {"course_id": course2_id, "skill_id": python_id, "min_level": 2},
            {"course_id": course2_id, "skill_id": sql_id, "min_level": 2},
        ]))

        conn.commit()
        print("Database seeded successfully with courses and skills!")

if __name__ == "__main__":
    seed()
