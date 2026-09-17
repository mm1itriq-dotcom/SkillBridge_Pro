# 🚀 SkillBridge Pro

SkillBridge Pro is a modern, high-performance educational platform designed to connect **Instructors** and **Students**. It empowers users to build profiles, share expertise, and bridge the gap between learning and teaching through a seamless, interactive experience.

## ✨ Key Features

* **Role-Based Access Control**: Distinct registration flows, endpoints, and dashboards for `Students` and `Instructors`.
* **Premium Interactive UI**: A sleek, modern frontend fully responsive to Light and Dark themes.
* **Dynamic Skill Tagging**: Students can select from predefined skills or dynamically add custom "Other" skills on the fly. Includes interactive proficiency level bars (1-5) directly integrated into the registration process.
* **Secure JWT Authentication**: Stateless and secure endpoint protection using JSON Web Tokens (JWT) and Bearer authentication.
* **High-Performance Backend**: The backend is powered by **FastAPI**, ensuring lightning-fast request handling, data validation, and automatic interactive API documentation.
* **Robust Database Layer**: Engineered with SQLAlchemy Core for direct, optimized, and safe database queries.

## 🛠️ Technology Stack

### Backend (API)
* **Framework**: FastAPI (Python)
* **Server**: Uvicorn
* **Database ORM**: SQLAlchemy Core
* **Security**: JWT (JSON Web Tokens)

### Frontend (UI)
* **Library**: React.js
* **Styling**: Custom CSS (Responsive Light/Dark Variables)
* **State Management**: React Hooks

## 🚀 Getting Started

### 1. Run the Backend (FastAPI)
Open your terminal (PowerShell) and run the following commands:
```bash
# Navigate to the project directory
cd C:\Users\mm1it\OneDrive\Documents\MyBigProjects\SkillBridge_Pro

# Activate the virtual environment
.\venv\Scripts\activate

# Ensure you have the required packages installed
pip install fastapi uvicorn sqlalchemy pyjwt

# Start the FastAPI server
python app.py
```
*(The API will be available at `http://localhost:5000`)*

### 2. Run the Frontend (React)
Open a **new** terminal and run:
```bash
# Navigate to the frontend directory
cd C:\Users\mm1it\OneDrive\Documents\MyBigProjects\SkillBridge_Pro\frontend

# Install dependencies (if you haven't already)
npm install

# Start the React development server
npm start
```
*(The Frontend will open automatically in your browser at `http://localhost:3000`)*

## 🔒 Security Note
Sensitive data such as database URLs and secret keys are securely managed using environment variables (`.env`). Ensure your `.env` file is present locally but never pushed to public repositories.