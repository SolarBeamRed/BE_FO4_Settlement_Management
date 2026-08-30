from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Settlements(Base):
    __tablename__ = 'settlements'

    settlement_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(unique=True)
    region: Mapped[str]
    description: Mapped[str]
    map_image_url: Mapped[str]
    how_to_obtain: Mapped[str]
    notes: Mapped[str | None]
    ref_id: Mapped[str]
    wiki_url: Mapped[str]

class SettlementsCraftingStations(Base):
    __tablename__ = 'settlements_crafting_stations'

    settlement_id: Mapped[int] = mapped_column(
        ForeignKey(Settlements.settlement_id),
        primary_key=True)
    weapons_workbench: Mapped[bool] = mapped_column(default=False)
    armor_workbench: Mapped[bool] = mapped_column(default=False)
    chemistry_station: Mapped[bool] = mapped_column(default=False)
    cooking_station: Mapped[bool] = mapped_column(default=False)
    power_armor_station: Mapped[bool] = mapped_column(default=False)