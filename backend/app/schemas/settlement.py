from pydantic import BaseModel, ConfigDict


class SettlementsCraftingStation(BaseModel):
    settlement_id: int
    weapons_workbench: bool
    armor_workbench: bool
    chemistry_station: bool
    cooking_station: bool
    power_armor_station: bool

    model_config = ConfigDict(from_attributes=True)


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

    crafting_stations: SettlementsCraftingStation

    model_config = ConfigDict(from_attributes=True)
