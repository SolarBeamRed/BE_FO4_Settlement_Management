from pydantic import BaseModel, ConfigDict, Field

from app.schemas.settlement import SettlementsResponse


# Response schema for tabular view of user settlements
class UserSettlementListItem(BaseModel):
    settlement_id: int
    name: str
    region: str | None = None
    addon: str

    unlocked: bool

    people: int | None = None
    food: int | None = None
    water: int | None = None
    power: int | None = None
    defense: int | None = None
    beds: int | None = None
    happiness: int | None = None


# Response schema for detailed view of single unlocked user settlement
class UserSettlementDetail(BaseModel):
    user_settlement_id: int
    settlement_id: int

    people: int
    food: int
    water: int
    power: int
    defense: int
    beds: int
    happiness: int
    notes: str | None

    settlement: SettlementsResponse


# Response schema for returning after user POSTs an unlocked settlement
class UserSettlementResponse(BaseModel):
    user_settlement_id: int
    settlement_id: int
    people: int
    food: int
    water: int
    power: int
    defense: int
    beds: int
    happiness: int
    notes: str | None = None

    model_config = ConfigDict(from_attributes=True)


class UserSettlementUpdate(BaseModel):
    people: int | None = Field(default=None, ge=0)
    food: int | None = Field(default=None, ge=0)
    water: int | None = Field(default=None, ge=0)
    power: int | None = Field(default=None, ge=0)
    defense: int | None = Field(default=None, ge=0)
    beds: int | None = Field(default=None, ge=0)
    happiness: int | None = Field(default=None, ge=0, le=100)
    notes: str | None = None

