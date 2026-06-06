from pathlib import Path
from sqlmodel import SQLModel, Session, create_engine

DB_DIR = Path(__file__).resolve().parent.parent.parent / 'data' / 'database.db'

sqlite_url = f'sqlite:///{DB_DIR}'
connect_args = {'check_same_thread': False}

engine = create_engine(url=sqlite_url, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
