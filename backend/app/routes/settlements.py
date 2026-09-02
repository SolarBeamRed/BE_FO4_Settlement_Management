from typing import Annotated

from fastapi import APIRouter, HTTPException, Path
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import SessionDependence
from app.models.settlement import Settlements
from app.schemas.settlement import SettlementsResponse

router = APIRouter(
    prefix='/settlements',
    tags=['settlements']
)


# __________________        ROUTES        ____________________


# All settlements at once


@router.get('/', response_model=list[SettlementsResponse])
def get_settlements(session: SessionDependence):
    query = select(Settlements).options(
        selectinload(Settlements.crafting_stations) # Same, eager loading again
    )

    settlements = session.scalars(query).all()

    return settlements


# Single settlement using settlement name
@router.get('/{settlement_name}', response_model=SettlementsResponse)
def get_settlement(settlement_name: Annotated[str, Path], session: SessionDependence):
    query = select(Settlements).where(
        Settlements.name == settlement_name
    ).options(
        selectinload(Settlements.crafting_stations)
        )
    
    settlement = session.scalar(query)

    if settlement is None:
        raise HTTPException(
            status_code=404,
            detail='Settlement not found'
        )

    return settlement

