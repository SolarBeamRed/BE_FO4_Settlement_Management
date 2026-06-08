from typing import Annotated

from fastapi import APIRouter, Body, Path,  HTTPException

from app.core.database import SessionDependence
from app.dependencies.auth import CurrentUserDependency, get_user_by_username
from app.schemas.user import UserProfileResponse, UserUpdate
from app.models.user import User
from app.routes.auth import check_existing_user


router = APIRouter(
    prefix='/users',
    tags=['user']
)


# __________________        ROUTES        ____________________


@router.get('/me', response_model=UserProfileResponse)
def return_current_user(current_user: CurrentUserDependency):
    return current_user


@router.patch('/me', response_model=UserProfileResponse)
async def update_user_profile(
    update_data: Annotated[UserUpdate, Body()],
    current_user: CurrentUserDependency,
    session: SessionDependence
):
    changes = update_data.model_dump(exclude_unset=True)

    if 'username' in changes:
        check_existing_user(username=changes['username'],session= session)   
    for field, value in changes.items():
        setattr(current_user, field, value)

    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user


@router.get('/{target_username}', response_model=UserProfileResponse)
async def get_searched_user(
    target_username: Annotated[str, Path()],
    session: SessionDependence
):
    target_user = get_user_by_username(target_username, session)
    if target_user is None:
        raise HTTPException(
            status_code=404,
            detail='User not found'
        )
    return target_user


# _____________________________________________________________________
