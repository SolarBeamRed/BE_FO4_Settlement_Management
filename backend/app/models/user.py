from datetime import datetime

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.core.database import Base

# User table in DB
# _____________      schema followed:      _____________
#
# 
# user_id                  |      int     PRIMARY KEY
# username                 |      text    UNIQUE 
# hashed_password          |      text
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


class User(Base):
    __tablename__ = 'users'

# Core
    user_id: Mapped[str] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(unique=True, index=True)
    hashed_password: Mapped[str]
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)
    updated_at: Mapped[datetime | None] = mapped_column(default=None)

# Extra personalized feel columns
    display_name: Mapped[str | None] = mapped_column(String(20), default=None)
    profile_picture_url: Mapped[str | None] = mapped_column(String(40), default=None)
    bio: Mapped[str | None] = mapped_column(String(50), default=None)
    favorite_settlement: Mapped[str | None] = mapped_column(String(30), default=None)
    favorite_faction: Mapped[str | None] = mapped_column(String(30), default=None)
