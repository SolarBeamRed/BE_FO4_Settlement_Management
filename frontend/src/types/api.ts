export interface Token { access_token: string; token_type: string; }
export interface UserResponse { user_id: number; username: string; display_name: string | null; }
export interface UserProfile { user_id: number; username: string; created_at: string; display_name: string | null; profile_picture_url: string | null; bio: string | null; favorite_settlement: string | null; favorite_faction: string | null; }
export interface UserUpdate { username?: string | null; display_name?: string | null; bio?: string | null; favorite_settlement?: string | null; favorite_faction?: string | null; }
export interface CraftingStations { settlement_id: number; weapons_workbench: boolean; armor_workbench: boolean; chemistry_station: boolean; cooking_station: boolean; power_armor_station: boolean; }
export interface Settlement { settlement_id: number; name: string; region: string | null; addon: string; description: string; map_image_url: string | null; how_to_obtain: string; notes: string | null; ref_id: string; wiki_url: string; crafting_stations: CraftingStations; }
