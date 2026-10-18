from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.database.session import SessionLocal
from app.core.config import settings
from app.core.security import hash_password, verify_password
from app.models.branch import Branch
from app.models.user import User


BRANCH_NAME = "+MundoTravel Principal"


def seed() -> None:
    with SessionLocal() as db:
        try:
            branch = db.scalar(select(Branch).where(Branch.name == BRANCH_NAME))
            if branch is None:
                branch = Branch(name=BRANCH_NAME, code="MT-PRINCIPAL")
                db.add(branch)
                db.flush()
                branch_result = "creada"
            else:
                branch_result = "existente"

            user = db.scalar(select(User).where(User.email == settings.DEV_USER_EMAIL))
            if user is None:
                user = User(
                    name=settings.DEV_USER_NAME,
                    email=settings.DEV_USER_EMAIL,
                    password_hash=hash_password(settings.DEV_USER_PASSWORD),
                    role="agent",
                    branch_id=branch.id,
                )
                db.add(user)
                db.flush()
                user_result = "creado"
            else:
                user_result = "existente"
                if user.name != settings.DEV_USER_NAME:
                    user.name = settings.DEV_USER_NAME
                    user_result = "actualizado"
                if not verify_password(settings.DEV_USER_PASSWORD, user.password_hash):
                    user.password_hash = hash_password(settings.DEV_USER_PASSWORD)
                    user_result = "actualizado"

            db.commit()
            print(f"Sucursal {branch_result}: {branch.id} - {branch.name}")
            print(f"Usuario {user_result}: {user.id} - {user.email}")
        except SQLAlchemyError:
            db.rollback()
            raise


if __name__ == "__main__":
    seed()
