from typing import Annotated

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionDependence
from app.models.user import User
from app.schemas.token import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/auth/token')


# _______________________________________________________________________________________ #


def get_user_by_username(username: str, session: Session) -> User | None:
    query = select(User).where(User.username == username)
    user:User | None = session.scalar(query)
    return user




def get_user_by_id(user_id: int | str, session: Session) -> User | None:
    user_id = int(user_id)
    user:User | None = session.get(User, user_id) 
    return user


# _______________________________________________________________________________________ #


async def get_current_user(session: SessionDependence , token: Annotated[str,Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=401,
        detail='Credentials could not be validated',
        headers={'WWW-Authenticate': 'Bearer'}
    )

    try:
        payload = jwt.decode(token, key=settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get('sub')
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except InvalidTokenError:
        raise credentials_exception

    user = get_user_by_id(user_id=token_data.user_id, session=session)
    if user is None:
        raise credentials_exception
    return user

CurrentUserDependency = Annotated[User, Depends(get_current_user)]


# _______________________________________________________________________________________ #


def get_current_active_user(user: CurrentUserDependency) -> User:
    if not user.is_active:
        raise HTTPException(status_code=400, detail='Not an active user')
    return user
