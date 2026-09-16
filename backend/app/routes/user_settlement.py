from typing import Annotated

from fastapi import APIRouter, Body, HTTPException, Path, status
from sqlalchemy import select

from app.core.database import SessionDependence
from app.dependencies.auth import CurrentUserDependency
from app.models.settlement import Settlements
from app.models.user_settlement import UserSettlement
from app.schemas.user_settlement import (
    UserSettlementListItem,
    UserSettlementResponse,
    UserSettlementUnlock,
    UserSettlementUpdate
)

router = APIRouter(
    prefix='/my-settlements',
    tags=['my-settlements']
)


# ____________________________     ROUTES    __________________________________

@router.post('/', response_model=UserSettlementResponse)
def post_settlement(user: CurrentUserDependency, body: Annotated[UserSettlementUnlock, Body], session: SessionDependence):
    settlement_id = body.settlement_id

    # Verifying if settlement_id is valid
    settlement = session.get(Settlements, settlement_id)
    if settlement is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='settlement with given id does not exist'
        )

    # Verify that user has not already unlocked same settlement
    existing = session.scalar(
        select(UserSettlement).where(
            UserSettlement.user_id == user.user_id,
            UserSettlement.settlement_id == settlement_id
        )
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail='settlement already unlocked'
        )

    # Creating settlement row and adding to database
    user_settlement = UserSettlement(
        user_id = user.user_id,
        settlement_id = settlement_id
    )
    session.add(user_settlement)
    session.commit()
    session.refresh(user_settlement)

    return user_settlement


@router.get('/', response_model=list[UserSettlementListItem])
def get_settlements(user: CurrentUserDependency, session: SessionDependence):
    stmt = (
        select(Settlements, UserSettlement).outerjoin(
            UserSettlement, 
                (UserSettlement.settlement_id == Settlements.settlement_id)
                 & (UserSettlement.user_id == user.user_id)
            
        )
    )

    results = session.execute(stmt).all()

    return [
        UserSettlementListItem(
            settlement_id=settlement.settlement_id,
            name=settlement.name,
            unlocked=user_settlement is not None,
            people=user_settlement.people if user_settlement else None,
            food=user_settlement.food if user_settlement else None,
            water=user_settlement.water if user_settlement else None,
            power=user_settlement.power if user_settlement else None,
            defense=user_settlement.defense if user_settlement else None,
            beds=user_settlement.beds if user_settlement else None,
            happiness=user_settlement.happiness if user_settlement else None,
        )
        for settlement, user_settlement in results
    ]


@router.patch('/my-settlements/{settlement_id}', response_model=UserSettlementUpdate)
def update_settlement(user: CurrentUserDependency,
                      settlement_id: Annotated[int, Path()],
                      settlement_updates: Annotated[UserSettlementUpdate, Body()],
                      session: SessionDependence):

    query = select(UserSettlement).where(
        UserSettlement.user_id == user.user_id,
        UserSettlement.settlement_id == settlement_id
    )
    user_settlement = session.scalar(query)

    if not user_settlement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='settlement not found in database'
        )

    update_data = settlement_updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user_settlement, field, value)
    session.commit()
    session.refresh(user_settlement)

    return user_settlement
