from flask import Flask, jsonify
from utils.decorators import login_required
from utils.errors import setup_error_handlers # <--- Import it here

app = Flask(__name__)
app.secret_key = 'super_secret_key_for_development' 

# Initialize the global error logger!
setup_error_handlers(app) # <--- Call it here

# Import Blueprints
from routes.auth import auth_bp
from routes.student import student_bp
from routes.instructor import instructor_bp
from routes.courses import courses_bp

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(student_bp)
app.register_blueprint(instructor_bp)
app.register_blueprint(courses_bp)

@app.route('/')
def home():
    return "SkillBridge Pro Backend API is running!"

# A test route to prove the logger works!
@app.route('/test-crash')
def test_crash():
    # This will trigger a ZeroDivisionError
    return 1 / 0 

if __name__ == '__main__':
    app.run(debug=True, port=5000)