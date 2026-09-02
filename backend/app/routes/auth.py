from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionDependence
from app.core.security import authenticate_user, create_access_token, get_password_hash
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserLogin, UserResponse

router = APIRouter(prefix='/auth', tags=['auth'])


# _______________________      HELPER FUNCTIONS     __________________________


def check_existing_user(username:str, session: Session):
    query = select(User).where(
        User.username == username
    )
    existing_user = session.scalar(query)
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


@router.post('/login', response_model=Token)
async def login(user_creds: UserLogin, session: SessionDependence):
    user = authenticate_user(username=user_creds.username,
                             password=user_creds.password,
                             session=session)
    if user is None:
        raise HTTPException(
            status_code=401,
            detail='Incorrect username or password',
            headers={'WWW-Authenticate': 'Bearer'}
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRY_MINUTES)
    access_token = create_access_token(user=user, expires_delta=access_token_expires)
    return Token(
        access_token=access_token,
        token_type='bearer'
    )


# Login, but with form instead of JSON. Solely for testing with Swagger, actual project will use JSON bodies for login
@router.post("/token", response_model=Token)
def token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: SessionDependence
):
    user = authenticate_user(
        username=form_data.username,
        password=form_data.password,
        session=session
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRY_MINUTES
    )

    return Token(
        access_token=create_access_token(
            user=user,
            expires_delta=expires
        ),
        token_type="bearer"
    )

# ____________________________    /ROUTES    __________________________________


