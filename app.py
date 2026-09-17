from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils.errors import setup_error_handlers

app = FastAPI(title="SkillBridge Pro API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_error_handlers(app)

from routes.auth import auth_bp
from routes.student import student_bp
from routes.instructor import instructor_bp
from routes.courses import courses_bp

app.include_router(auth_bp)
app.include_router(student_bp)
app.include_router(instructor_bp)
app.include_router(courses_bp)

@app.get('/')
def home():
    return {"message": "SkillBridge Pro FastAPI Backend is running!"}

@app.get('/test-crash')
def test_crash():
    return 1 / 0 

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=5000, reload=True)