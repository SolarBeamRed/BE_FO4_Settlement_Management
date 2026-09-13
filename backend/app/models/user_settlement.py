from sqlalchemy import ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.settlement import Settlements
from app.models.user import User

# User settlement table schema:

#  user_settlement_id   |             int PRIMARY
#  user_id              |             int FOREIGN
#  settlement_id        |             int FOREIGN

#  people               |             int
#  food                 |             int
#  water                |             int
#  power                |             int
#  defense              |             int
#  beds                 |             int
#  happiness            |             int
#  notes                |             text

class UserSettlement(Base):
    __tablename__ = 'user_settlements'

    user_settlement_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey('users.user_id', ondelete='CASCADE'),
        nullable=False
    )

    settlement_id: Mapped[int] = mapped_column(
        ForeignKey('settlements.settlement_id'),
        nullable=False
    )

    people: Mapped[int] = mapped_column(Integer, default=0)
    food: Mapped[int] = mapped_column(Integer, default=0)
    water: Mapped[int] = mapped_column(Integer, default=0)
    power: Mapped[int] = mapped_column(Integer, default=0)
    defense: Mapped[int] = mapped_column(Integer, default=0)
    beds: Mapped[int] = mapped_column(Integer, default=0)
    happiness: Mapped[int] = mapped_column(Integer, default=0)

    notes: Mapped[str | None] = mapped_column(Text, default=None)

    user: Mapped["User"] = relationship(
    "User",
    back_populates="user_settlements",
    )

    settlement: Mapped["Settlements"] = relationship(
        "Settlements",
        back_populates="user_settlements",
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "settlement_id",
            name="uq_user_settlement",
        ),
    )