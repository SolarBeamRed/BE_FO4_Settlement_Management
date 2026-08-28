from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

from app.core.config import settings
from app.core.database import SessionDependence
from app.dependencies.auth import get_user_by_username
from app.models.user import User

password_hasher = PasswordHash.recommended()


# ________________________________________________________________________________________


def get_password_hash(password: str):
    return password_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return password_hasher.verify(plain_password, hashed_password)


# ________________________________________________________________________________________


def authenticate_user(username: str, password: str, session: SessionDependence):
    user:User|None = get_user_by_username(username=username, session=session)
    if not user:
        DUMMY_HASH = get_password_hash('asdhndfgiqudaj,#sbwi')
        _ = verify_password(password, DUMMY_HASH)
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


# ________________________________________________________________________________________


def create_access_token(user:User, expires_delta: timedelta | None) -> str:
    payload = {
        'sub': str(user.user_id)
    }
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=60)
    payload.update({'exp': expire})
    encoded_jwt = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
