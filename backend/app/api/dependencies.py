import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database.session import get_db
from app.models.user import User


bearer_scheme = HTTPBearer(auto_error=False, scheme_name="BearerAuth")


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Security(bearer_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No fue posible validar la sesión.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise error
    subject = decode_access_token(credentials.credentials)
    if subject is None:
        raise error
    try:
        user_id = uuid.UUID(subject)
    except ValueError as exc:
        raise error from exc
    user = db.get(User, user_id)
    if user is None or not user.active:
        raise error
    return user
