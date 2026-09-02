from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.database import create_db_and_tables
from app.routes import auth, settlements, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)
app.include_router(auth.router)
app.include_router(settlements.router)
app.include_router(users.router)

@app.get('/')
def print_root():
    return {'msg': 'Hello Survivors from root'}
