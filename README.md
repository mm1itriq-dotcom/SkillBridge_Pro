# SkillBridge Pro

SkillBridge Pro is a modern, full-stack educational platform that revolutionizes how students discover courses. Instead of scrolling through endless catalogs, SkillBridge Pro analyzes a student's current skill profile and algorithmically matches them with courses that perfectly bridge their knowledge gaps.

## ✨ Key Features

- **Algorithmic Course Matching**: Calculates a dynamic "Match Score" based on a student's current proficiency levels versus a course's minimum skill requirements.
- **Role-Based Workflows**: Dedicated dashboards and permissions for **Instructors** (course creators) and **Students** (learners).
- **Instructor Dashboard**: Instructors can author, edit, and safely delete courses. The system uses cascading database constraints to ensure no orphaned data is left behind.
- **Dynamic Skill Profiles**: Students can map out their current skills and proficiencies, directly influencing which courses are recommended to them.
- **Real-Time Filtering**: Instant client-side search and dynamic dropdown filtering based on course requirements.
- **Sleek, Modern UI**: A beautiful dark-navy theme featuring custom-built, animated frosted-glass modals and inline validation badges—completely free of native browser alerts.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router, raw CSS (Custom Dark Theme & Animations)
- **Backend**: Python, Flask, SQLAlchemy, JWT Authentication
- **Database**: PostgreSQL (using UUIDs and cascading relational constraints)

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Python 3.10+
- PostgreSQL (Ensure you have a database created and accessible)

### 1. Backend Setup (Flask)
Navigate to the root directory and set up your virtual environment:

```bash
# Create and activate a virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows

# Install dependencies
pip install flask flask-cors psycopg2 sqlalchemy pyjwt bcrypt

# Configure the Database
# Open `db.py` and ensure the database connection string matches your local PostgreSQL setup.

# Run the Flask server
python app.py
```
The server will start on `http://127.0.0.1:5000`.

### 2. Frontend Setup (React/Vite)
Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The application will be accessible at `http://localhost:5173`.

## 🔐 Security & Database Integrity
SkillBridge Pro enforces strict data integrity rules. Using PostgreSQL's `ON DELETE CASCADE`, if an instructor deletes a course or a student deletes their account, all associated relationships (enrollments, skill requirements, etc.) are safely destroyed to maintain a clean database schema.

## 🎨 Design Philosophy
The user experience heavily prioritizes non-intrusive, aesthetically pleasing feedback. Window `alert()` and `confirm()` dialogs are strictly avoided in favor of highly-responsive, animated React components and sleek frosted-glass modals.