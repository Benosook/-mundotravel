from app.core.config import Settings


def test_render_postgresql_url_uses_psycopg_driver() -> None:
    settings = Settings(
        _env_file=None,
        DATABASE_URL="postgresql://user:password@database.internal:5432/mundotravel",
    )

    assert settings.DATABASE_URL == (
        "postgresql+psycopg://user:password@database.internal:5432/mundotravel"
    )


def test_explicit_psycopg_url_is_preserved() -> None:
    database_url = "postgresql+psycopg://user:password@localhost:5432/mundotravel"
    settings = Settings(_env_file=None, DATABASE_URL=database_url)

    assert settings.DATABASE_URL == database_url
