from fastapi import FastAPI
from contextlib import asynccontextmanager

from models.user import User
from core.database import create_db_and_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

@app.get('/')
def print_root():
    return {'msg': 'Hello Survivors from root'}
