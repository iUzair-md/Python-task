from fastapi import FastAPI, Depends, HTTPException, status, Query
from pydantic import BaseModel
from typing import List, Annotated, Dict, Optional
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer
import jwt
from database import engine, get_db
import models
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler

app = FastAPI()

origins = [
    "http://localhost:5173",  
    "http://127.0.0.1:5173",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

models.Base.metadata.create_all(bind=engine)

SECRET_KEY = "your_secret_key" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 3

class UserCreate(BaseModel):
    f_name: str
    l_name: str
    email_id: str
    phone_number: str
    address: str

class UserResponse(BaseModel):
    id: int
    f_name: str
    l_name: str
    email_id: str
    phone_number: str
    address: str
    created_date: datetime

    class Config:
        orm_mode = True

class PaginatedUserResponse(BaseModel):
    users: List[UserResponse]
    next_url: Optional[str]
    prev_url: Optional[str]

class Token(BaseModel):
    access_token: str
    token_type: str

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: Dict[str, str], expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/token", response_model=Token)
def generate_token():
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": "user"}, expires_delta=expires_delta)
    return {"access_token": access_token, "token_type": "bearer"}

def validate_token(token: str) -> bool:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("exp") < datetime.utcnow().timestamp():
            return False
        return True
    except jwt.PyJWTError:
        return False

db_dependency = Annotated[Session, Depends(get_db)]

@app.post("/users/", status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: db_dependency, access_token: str = Depends(oauth2_scheme)):
    if not validate_token(access_token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    
    db_user = models.User(**user.dict(), created_date=datetime.utcnow())
    db.add(db_user)
    db.commit()
    return {"message": "User created successfully"}

scheduler = BackgroundScheduler()

@app.get("/users/", response_model=PaginatedUserResponse)
def get_users(access_token: str = Depends(oauth2_scheme), db: Session = Depends(get_db),    page: int = Query(1, ge=1),     per_page: int = Query(5, le=100),    sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$")  # New query parameter for sorting order
):
    if not validate_token(access_token):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    offset = (page - 1) * per_page
    limit = per_page

    order_by_clause = asc(models.User.created_date) if sort_order == "asc" else desc(models.User.created_date)



    users = db.query(models.User).order_by(order_by_clause).offset(offset).limit(limit).all()


    total_users = db.query(models.User).count()

    next_url = f"/users/?page={page + 1}&per_page={per_page}&sort_order={sort_order}" if offset + limit < total_users else None

    prev_url = f"/users/?page={page - 1}&per_page={per_page}&sort_order={sort_order}" if page > 1 else None


    return {
        "users": users,
        "next_url": next_url,
        "prev_url": prev_url
    }


def scheduled_token_creation():
    
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": "scheduled"}, expires_delta=expires_delta)
    # You might want to save this token somewhere or use it in your application
    print(f"Scheduled access token created at {datetime.now()}: {access_token}")

scheduler.add_job(scheduled_token_creation, 'interval', minutes=2, seconds=50)

scheduler.start()

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()

