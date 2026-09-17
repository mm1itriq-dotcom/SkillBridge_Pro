import jwt
from fastapi import Security, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()
SECRET_KEY = "super_secret_key_for_development"

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return data
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired! Please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token is invalid!")

def instructor_required(user: dict = Security(get_current_user)):
    if user.get('role') != 'instructor':
        raise HTTPException(status_code=403, detail="Unauthorized: Instructors only.")
    return user
