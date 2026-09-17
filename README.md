<div align="center">
  <h1>🌉 SkillBridge Pro</h1>
  <p><b>An AI-Inspired, Algorithmic Course Matching & Educational Platform</b></p>
</div>

---

## 📖 About The Project

SkillBridge Pro is a modern, full-stack educational platform designed to revolutionize how students discover learning paths. Instead of endlessly scrolling through course catalogs, SkillBridge Pro analyzes a student's current skill profile and algorithmically matches them with courses that perfectly bridge their knowledge gaps using a dynamic **Match Score** system.

### ✨ Key Features

*   🧠 **Algorithmic Course Matching:** Dynamically calculates a "Match Score" by comparing a student's current proficiency levels against a course's minimum skill requirements.
*   👥 **Role-Based Workflows:** Secure, dedicated dashboards and tailored permissions for **Instructors** (course creators) and **Students** (learners).
*   ⚙️ **Instructor Dashboard:** Allows educators to author, manage, and safely delete courses. Utilizes strict cascading database constraints (`ON DELETE CASCADE`) to ensure zero orphaned data.
*   📊 **Dynamic Skill Profiles:** Students can visually map out their current skills, which directly influences the recommendation engine.
*   ⚡ **Real-Time Filtering:** Instant client-side search and dynamic dropdown filtering without page reloads.
*   🎨 **Sleek, Modern UI:** A beautiful dark-navy aesthetic featuring animated frosted-glass modals and inline validation badges—providing a seamless UX completely free of native browser alerts.

---

## 🏗️ Architecture & Tech Stack

This project enforces a strict separation of concerns, utilizing a modern, decoupled micro-architecture:

### Backend (REST API)
*   **Language:** Python 3.10+
*   **Framework:** Flask
*   **Database Engine:** PostgreSQL
*   **ORM / Query Builder:** SQLAlchemy 2.0 (Core)
*   **Authentication:** JWT (JSON Web Tokens) & Bcrypt for secure password hashing
*   **Security:** `python-dotenv` for secure environment variable management

### Frontend (Client Interface)
*   **Framework:** React 18
*   **Build Tool:** Vite (for Lightning-Fast HMR)
*   **Routing:** React Router v6
*   **Styling:** Raw CSS (Custom Dark Theme & Frosted-Glass Animations)

---

## 🚀 Getting Started (Local Development)

Follow these steps to run the platform locally on your machine.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v16+) & npm
*   [Python](https://www.python.org/) (3.10+)
*   [PostgreSQL](https://www.postgresql.org/) (Ensure a database named `skillbridge` is created locally)

### 1. Backend Setup (Flask API)

Open a terminal in the root directory of the project:

```bash
# 1. Activate the virtual environment (Windows)
.\venv\Scripts\activate

# 2. Install dependencies (including dotenv for security)
pip install flask flask-cors psycopg2 sqlalchemy pyjwt bcrypt python-dotenv

# 3. Configure the Database
# Ensure your `.env` file exists in the root directory with the following variable:
# DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost/skillbridge"

# 4. Initialize and Seed the Database
python init_db.py
python seed_db.py  # (Optional: Creates an instructor account and dummy courses/skills)

# 5. Run the Flask Server
python app.py
```
*(The backend REST API will start on `http://127.0.0.1:5000`)*

### 2. Frontend Setup (React/Vite)

Open a **second** terminal window and navigate to the frontend folder:

```bash
cd frontend

# 1. Install frontend dependencies
npm install

# 2. Start the Vite development server
npm run dev
```
*(The React application will automatically bind to `http://localhost:5173`)*

---

## 🔐 Security & Database Integrity

SkillBridge Pro enforces strict data integrity rules. Using PostgreSQL's robust relational schema, if an instructor deletes a course or a student deletes their account, all associated relationships (enrollments, skill requirements, match scores) are safely and instantly destroyed to maintain a clean, performant database schema.

---

*Designed and Developed by Mohammed Yousef Itriq.*