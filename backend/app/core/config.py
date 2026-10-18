from functools import lru_cache
from pydantic import Field, field_validator, model_validator

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "+MundoTravel API"
    APP_ENV: str = "development"
    API_V1_PREFIX: str = "/api/v1"
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    DATABASE_URL: str = (
        "postgresql+psycopg://mundotravel:mundotravel@localhost:5432/mundotravel"
    )
    AUTH_SECRET_KEY: str = Field(default="development-only-change-me-at-least-32-bytes", min_length=32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=480, gt=0)
    JWT_ALGORITHM: str = "HS256"
    DEV_USER_NAME: str = "Ariadna"
    DEV_USER_EMAIL: str = "ariadna@mundotravel.local"
    DEV_USER_PASSWORD: str = "ChangeMe123!"
    INITIAL_USER_NAME: str | None = None
    INITIAL_USER_EMAIL: str | None = None
    INITIAL_USER_PASSWORD: str | None = None

    @field_validator("DATABASE_URL")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        """Use psycopg when a provider supplies a generic PostgreSQL URL."""
        if value.startswith("postgres://"):
            return f"postgresql+psycopg://{value.removeprefix('postgres://')}"
        if value.startswith("postgresql://"):
            return f"postgresql+psycopg://{value.removeprefix('postgresql://')}"
        return value

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        if self.APP_ENV.lower() == "production" and self.AUTH_SECRET_KEY == "development-only-change-me-at-least-32-bytes":
            raise ValueError("AUTH_SECRET_KEY must be configured for production")
        return self

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
