from lzma import PRESET_DEFAULT
from sqlmodel import Session, select
from fastapi import APIRouter, HTTPException

from app.core.database import SessionDependence
from app.core.security import get_password_hash, verify_password
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.models.user import User

router = APIRouter(prefix='/auth', tags=['auth'])


# _______________________      HELPER FUNCTIONS     __________________________

def check_existing_user(username:str, session: Session):
    statement = select(User).where(
        User.username == username
    )
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail='Username already exists')



# ____________________________     ROUTES    __________________________________

@router.post('/register', response_model=UserResponse)
async def register_user(user_creds: UserCreate, session: SessionDependence):
    username = user_creds.username
    check_existing_user(username, session)
    hashed_password = get_password_hash(user_creds.password)

    new_user = User(username=username, hashed_password=hashed_password)
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return new_user
