import os
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends
from sqlalchemy import URL, create_engine
from sqlalchemy.orm import DeclarativeBase, Session

###

load_dotenv()

database_url = URL.create(
    'postgresql+psycopg',
    username='fallout_app',
    password=os.environ['DB_PASSWORD'],
    host='localhost',
    port=5432,
    database='fallout_settlement_manager'
)

engine = create_engine(database_url)



class Base(DeclarativeBase):
    pass



# __________________     Functions     ____________________

def create_db_and_tables():
    Base.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

# __________________    /Functions     ____________________



SessionDependence = Annotated[Session, Depends(get_session)]
