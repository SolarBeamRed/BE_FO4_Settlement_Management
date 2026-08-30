from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRY_MINUTES: int
    DB_ROLE: str
    DB_PASSWORD: str

    model_config = SettingsConfigDict(
        env_file='.env'
    )

settings = Settings() # type: ignore
