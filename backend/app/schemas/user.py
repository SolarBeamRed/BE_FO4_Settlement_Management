from datetime import datetime
from pydantic import BaseModel

# User class for create/login
class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

# default User Response model, should be enough for most
class UserResponse(BaseModel):
    user_id: int
    username: str
    display_name: str | None

# User Profile Response model
class UserProfileResponse(BaseModel):
    user_id: int
    username: str
    created_at: datetime

    display_name: str | None = None 
    profile_picture_url: str | None = None
    bio: str | None = None
    favorite_settlement: str | None = None
    favorite_faction: str | None = None

# Class for user profile update
class UserUpdate(BaseModel):
    username: str | None = None
    
    display_name: str | None = None 
    bio: str | None = None
    favorite_settlement: str | None = None
    favorite_faction: str | None = None

