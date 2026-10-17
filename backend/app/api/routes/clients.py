import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.client import ClientStatus
from app.schemas.client import ClientCreate, ClientRead, ClientUpdate
from app.services import ConflictError
from app.services.client_service import create_client, get_client, list_clients, update_client


router = APIRouter(prefix="/clients", tags=["Clients"])
DbSession = Annotated[Session, Depends(get_db)]


@router.post("", response_model=ClientRead, status_code=status.HTTP_201_CREATED)
def create_client_endpoint(payload: ClientCreate, db: DbSession) -> ClientRead:
    try:
        return ClientRead.model_validate(create_client(db, payload))
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.get("", response_model=list[ClientRead])
def list_clients_endpoint(
    db: DbSession,
    search: str | None = None,
    client_status: Annotated[ClientStatus | None, Query(alias="status")] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[ClientRead]:
    return [
        ClientRead.model_validate(client)
        for client in list_clients(
            db, search=search, status=client_status, limit=limit, offset=offset
        )
    ]


@router.get("/{client_id}", response_model=ClientRead)
def get_client_endpoint(client_id: uuid.UUID, db: DbSession) -> ClientRead:
    client = get_client(db, client_id)
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente no encontrado.")
    return ClientRead.model_validate(client)


@router.patch("/{client_id}", response_model=ClientRead)
def update_client_endpoint(client_id: uuid.UUID, payload: ClientUpdate, db: DbSession) -> ClientRead:
    client = get_client(db, client_id)
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente no encontrado.")
    try:
        return ClientRead.model_validate(update_client(db, client, payload))
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
