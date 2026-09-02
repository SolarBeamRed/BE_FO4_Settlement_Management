from pydantic import BaseModel

class SettlementsResponse(BaseModel):
    settlement_id: int
    name: str
    region: str | None
    addon: str
    description: str
    map_image_url: str
    how_to_obtain: str
    notes: str | None
    ref_id: str
    wiki_url: str

class SettlementsCraftingStationResponse(BaseModel):
    settlement_id: int
    weapons_workbench: bool
    armor_workbench: bool
    chemistry_station: bool
    cooking_station: bool
    power_armor_station: bool