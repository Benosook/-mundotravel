from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.database.session import SessionLocal
from app.models.branch import Branch
from app.models.user import User


BRANCH_NAME = "+MundoTravel Principal"
USER_EMAIL = "frida@mundotravel.local"


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

            user = db.scalar(select(User).where(User.email == USER_EMAIL))
            if user is None:
                user = User(
                    name="Frida",
                    email=USER_EMAIL,
                    password_hash="AUTHENTICATION_NOT_IMPLEMENTED",
                    role="agent",
                    branch_id=branch.id,
                )
                db.add(user)
                db.flush()
                user_result = "creado"
            else:
                user_result = "existente"

            db.commit()
            print(f"Sucursal {branch_result}: {branch.id} - {branch.name}")
            print(f"Usuario {user_result}: {user.id} - {user.email}")
        except SQLAlchemyError:
            db.rollback()
            raise


if __name__ == "__main__":
    seed()
