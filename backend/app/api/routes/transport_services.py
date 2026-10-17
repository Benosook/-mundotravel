import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.transport_service import TransportServiceCreate, TransportServiceRead, TransportServiceUpdate
from app.services import BusinessRuleError, ConflictError, ResourceNotFoundError
from app.services.transport_service_service import (
    create_transport_service, delete_transport_service, get_transport_service,
    list_transport_services, update_transport_service,
)


router = APIRouter(prefix="/quotes/{quote_id}/transports", tags=["Transports"])
DbSession = Annotated[Session, Depends(get_db)]


def _get(quote_id: uuid.UUID, service_id: uuid.UUID, db: Session):
    try:
        service = get_transport_service(db, quote_id, service_id)
    except ResourceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    if service is None:
        raise HTTPException(status_code=404, detail="Transporte no encontrado.")
    return service


@router.post("", response_model=TransportServiceRead, status_code=201)
def create(payload: TransportServiceCreate, quote_id: uuid.UUID, db: DbSession):
    try:
        return create_transport_service(db, quote_id, payload)
    except ResourceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.get("", response_model=list[TransportServiceRead])
def list_all(quote_id: uuid.UUID, db: DbSession):
    try:
        return list_transport_services(db, quote_id)
    except ResourceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{service_id}", response_model=TransportServiceRead)
def get_one(quote_id: uuid.UUID, service_id: uuid.UUID, db: DbSession):
    return _get(quote_id, service_id, db)


@router.patch("/{service_id}", response_model=TransportServiceRead)
def update(payload: TransportServiceUpdate, quote_id: uuid.UUID, service_id: uuid.UUID, db: DbSession):
    try:
        return update_transport_service(db, _get(quote_id, service_id, db), payload)
    except BusinessRuleError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.delete("/{service_id}", status_code=204)
def delete(quote_id: uuid.UUID, service_id: uuid.UUID, db: DbSession) -> Response:
    try:
        delete_transport_service(db, _get(quote_id, service_id, db))
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return Response(status_code=204)
