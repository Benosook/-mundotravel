"""Create the first production user once, using environment variables.

Run manually after migrations. Existing users are left unchanged.
"""

from email_validator import EmailNotValidError, validate_email
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.security import hash_password
from app.database.session import SessionLocal
from app.models.branch import Branch
from app.models.user import User


BRANCH_NAME = "+MundoTravel Principal"
BRANCH_CODE = "MT-PRINCIPAL"


def required(value: str | None, variable: str) -> str:
    normalized = (value or "").strip()
    if not normalized:
        raise RuntimeError(f"Define {variable} before running the initial user seed.")
    return normalized


def seed() -> None:
    name = required(settings.INITIAL_USER_NAME, "INITIAL_USER_NAME")
    email = required(settings.INITIAL_USER_EMAIL, "INITIAL_USER_EMAIL").lower()
    password = required(settings.INITIAL_USER_PASSWORD, "INITIAL_USER_PASSWORD")
    try:
        validate_email(email, check_deliverability=False)
    except EmailNotValidError as exc:
        raise RuntimeError("INITIAL_USER_EMAIL is not a valid email address.") from exc
    if len(password) < 12:
        raise RuntimeError("INITIAL_USER_PASSWORD must contain at least 12 characters.")

    with SessionLocal() as db:
        try:
            branch = db.scalar(select(Branch).where(Branch.code == BRANCH_CODE))
            if branch is None:
                branch = Branch(name=BRANCH_NAME, code=BRANCH_CODE)
                db.add(branch)
                db.flush()

            existing = db.scalar(select(User).where(User.email == email))
            if existing is not None:
                print("Initial user already exists; no credentials were changed.")
                return

            db.add(User(
                name=name,
                email=email,
                password_hash=hash_password(password),
                role="admin",
                branch_id=branch.id,
                active=True,
            ))
            db.commit()
            print("Initial production user created successfully.")
        except SQLAlchemyError:
            db.rollback()
            raise


if __name__ == "__main__":
    seed()
