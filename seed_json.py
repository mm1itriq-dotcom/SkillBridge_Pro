import json
import uuid
from db import engine
from models import users, skills, courses, course_skill_requirements
from sqlalchemy import insert, select
from werkzeug.security import generate_password_hash

def seed_from_json():
    with open('courses.json', 'r') as f:
        data = json.load(f)

    with engine.connect() as conn:
        # Get or create an instructor
        instructor = conn.execute(select(users).where(users.c.email == "instructor@expert.com")).fetchone()
        if not instructor:
            instructor_id = uuid.uuid4()
            conn.execute(insert(users).values(
                id=instructor_id,
                email="instructor@expert.com",
                password_hash=generate_password_hash("password123!"),
                role="instructor"
            ))
        else:
            instructor_id = instructor.id

        # Fetch existing skills for lookup
        existing_skills = conn.execute(select(skills)).fetchall()
        skill_map = {s.name: s.id for s in existing_skills}

        for course in data:
            # Check if course already exists to avoid duplicates if run multiple times
            existing_course = conn.execute(select(courses).where(courses.c.title == course['title'])).fetchone()
            if existing_course:
                continue

            # Insert course
            course_id = uuid.uuid4()
            conn.execute(insert(courses).values(
                id=course_id,
                title=course['title'],
                description=course['description'],
                instructor_id=instructor_id
            ))

            for req in course['requirements']:
                skill_name = req['skill_name']
                skill_cat = req['category']
                
                if skill_name not in skill_map:
                    new_skill_id = uuid.uuid4()
                    conn.execute(insert(skills).values(
                        id=new_skill_id,
                        name=skill_name,
                        category=skill_cat
                    ))
                    skill_map[skill_name] = new_skill_id

                conn.execute(insert(course_skill_requirements).values(
                    course_id=course_id,
                    skill_id=skill_map[skill_name],
                    min_level=req['min_level']
                ))

        conn.commit()
        print(f"Successfully seeded courses from JSON!")

if __name__ == "__main__":
    seed_from_json()
