import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.flight_service import FlightServiceCreate, FlightServiceRead, FlightServiceUpdate
from app.services import BusinessRuleError, ConflictError, ResourceNotFoundError
from app.services.flight_service_service import (
    create_flight_service, delete_flight_service, get_flight_service,
    list_flight_services, update_flight_service,
)


router = APIRouter(prefix="/quotes/{quote_id}/flights", tags=["Flights"])
DbSession = Annotated[Session, Depends(get_db)]


def _get(quote_id: uuid.UUID, service_id: uuid.UUID, db: Session):
    try:
        service = get_flight_service(db, quote_id, service_id)
    except ResourceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    if service is None:
        raise HTTPException(status_code=404, detail="Vuelo no encontrado.")
    return service


@router.post("", response_model=FlightServiceRead, status_code=201)
def create(payload: FlightServiceCreate, quote_id: uuid.UUID, db: DbSession):
    try:
        return create_flight_service(db, quote_id, payload)
    except ResourceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.get("", response_model=list[FlightServiceRead])
def list_all(quote_id: uuid.UUID, db: DbSession):
    try:
        return list_flight_services(db, quote_id)
    except ResourceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{service_id}", response_model=FlightServiceRead)
def get_one(quote_id: uuid.UUID, service_id: uuid.UUID, db: DbSession):
    return _get(quote_id, service_id, db)


@router.patch("/{service_id}", response_model=FlightServiceRead)
def update(payload: FlightServiceUpdate, quote_id: uuid.UUID, service_id: uuid.UUID, db: DbSession):
    try:
        return update_flight_service(db, _get(quote_id, service_id, db), payload)
    except BusinessRuleError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.delete("/{service_id}", status_code=204)
def delete(quote_id: uuid.UUID, service_id: uuid.UUID, db: DbSession) -> Response:
    try:
        delete_flight_service(db, _get(quote_id, service_id, db))
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return Response(status_code=204)
