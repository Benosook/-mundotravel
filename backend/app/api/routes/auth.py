from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.security import create_access_token
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import CurrentUserRead, LoginRequest, TokenResponse
from app.services.auth_service import authenticate_user


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Annotated[Session, Depends(get_db)]) -> TokenResponse:
    user = authenticate_user(db, payload.email, payload.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Correo o contraseña incorrectos.")
    return TokenResponse(access_token=create_access_token(str(user.id)), user=CurrentUserRead.model_validate(user))


@router.get("/me", response_model=CurrentUserRead)
def me(current_user: Annotated[User, Depends(get_current_user)]) -> CurrentUserRead:
    return CurrentUserRead.model_validate(current_user)
