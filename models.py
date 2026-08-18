from sqlalchemy import Table, Column, String, Text, ForeignKey, DateTime, CheckConstraint, Uuid, Integer
from sqlalchemy.sql import func
import uuid
from db import metadata

# 1. User Account
users = Table(
    'users', metadata,
    Column('id', Uuid, primary_key=True, default=uuid.uuid4),
    Column('email', String(120), unique=True, nullable=False),
    Column('password_hash', String(255), nullable=False),
    Column('role', String(20), nullable=False)
)

# 2. Skill Library
skills = Table(
    'skills', metadata,
    Column('id', Uuid, primary_key=True, default=uuid.uuid4),
    Column('name', String(100), unique=True, nullable=False),
    Column('category', String(100), nullable=False)
)

# 3. User Skill Profile
user_skills = Table(
    'user_skills', metadata,
    Column('user_id', Uuid, ForeignKey('users.id', ondelete="CASCADE"), primary_key=True),
    Column('skill_id', Uuid, ForeignKey('skills.id', ondelete="CASCADE"), primary_key=True),
    Column('proficiency_level', Integer, CheckConstraint('proficiency_level >= 1 AND proficiency_level <= 5'), nullable=False)
)

# 4. Skill History Log
skill_history = Table(
    'skill_history', metadata,
    Column('id', Uuid, primary_key=True, default=uuid.uuid4),
    Column('user_id', Uuid, ForeignKey('users.id', ondelete="CASCADE"), nullable=False),
    Column('skill_id', Uuid, ForeignKey('skills.id', ondelete="CASCADE"), nullable=False),
    Column('previous_level', Integer, nullable=True),
    Column('new_level', Integer, nullable=False),
    Column('timestamp', DateTime(timezone=True), server_default=func.now())
)

# 5. Course Offering
courses = Table(
    'courses', metadata,
    Column('id', Uuid, primary_key=True, default=uuid.uuid4),
    Column('title', String(150), nullable=False),
    Column('description', Text, nullable=False),
    Column('instructor_id', Uuid, ForeignKey('users.id', ondelete="CASCADE"), nullable=False),
    Column('created_at', DateTime(timezone=True), server_default=func.now())
)

# 6. Course Skill Requirement
course_skill_requirements = Table(
    'course_skill_requirements', metadata,
    Column('course_id', Uuid, ForeignKey('courses.id', ondelete="CASCADE"), primary_key=True),
    Column('skill_id', Uuid, ForeignKey('skills.id', ondelete="CASCADE"), primary_key=True),
    Column('min_level', Integer, CheckConstraint('min_level >= 1 AND min_level <= 5'), nullable=False)
)

# 7. Enrollments
enrollments = Table(
    'enrollments', metadata,
    Column('user_id', Uuid, ForeignKey('users.id', ondelete="CASCADE"), primary_key=True),
    Column('course_id', Uuid, ForeignKey('courses.id', ondelete="CASCADE"), primary_key=True),
    Column('enrolled_at', DateTime(timezone=True), server_default=func.now())
)