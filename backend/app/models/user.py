from datetime import datetime

from sqlalchemy import Column, String
from sqlmodel import Field, SQLModel

# User table in DB
# _____________      schema followed:      _____________
#
# 
# user_id                  |      int     PRIMARY KEY
# username                 |      text    UNIQUE 
# hashed_password          |      text
# profile_picture_url      |      text
# is_active                |      bool
# created_at               |      datetime
# updated_at               |      datetime
#                          | 
# display_name             |      text
# profile_picture_url      |      text
# bio                      |      text
# favorite_settlement      |      text
# favorite_faction         |      text
#


class User(SQLModel, table=True):

# Core
    user_id: int | None = Field(default=None, primary_key=True)
    username: str = Field(sa_column=Column(String, unique=True, index=True))
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime | None = None

# Extra personalized feel columns
    display_name: str | None = Field(default=None, max_length=20)
    profile_picture_url: str | None = None
    bio: str | None = Field(default=None, max_length=50)
    favorite_settlement: str | None = Field(default=None, max_length=50)
    favorite_faction: str | None = Field(default=None, max_length=50)
