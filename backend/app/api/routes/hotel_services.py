import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.hotel_service import HotelServiceCreate, HotelServiceRead, HotelServiceUpdate
from app.services import BusinessRuleError, ConflictError, ResourceNotFoundError
from app.services.hotel_service_service import (
    create_hotel_service, delete_hotel_service, get_hotel_service, list_hotel_services, update_hotel_service,
)


router = APIRouter(prefix="/quotes/{quote_id}/hotels", tags=["Hotels"])
DbSession = Annotated[Session, Depends(get_db)]


def not_found() -> HTTPException:
    return HTTPException(status_code=404, detail="Hotel no encontrado.")


@router.post("", response_model=HotelServiceRead, status_code=201)
def create(payload: HotelServiceCreate, quote_id: uuid.UUID, db: DbSession):
    try:
        return create_hotel_service(db, quote_id, payload)
    except ResourceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.get("", response_model=list[HotelServiceRead])
def list_all(quote_id: uuid.UUID, db: DbSession):
    try:
        return list_hotel_services(db, quote_id)
    except ResourceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{service_id}", response_model=HotelServiceRead)
def get_one(quote_id: uuid.UUID, service_id: uuid.UUID, db: DbSession):
    try:
        service = get_hotel_service(db, quote_id, service_id)
    except ResourceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    if service is None:
        raise not_found()
    return service


@router.patch("/{service_id}", response_model=HotelServiceRead)
def update(payload: HotelServiceUpdate, quote_id: uuid.UUID, service_id: uuid.UUID, db: DbSession):
    service = get_one(quote_id, service_id, db)
    try:
        return update_hotel_service(db, service, payload)
    except BusinessRuleError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(quote_id: uuid.UUID, service_id: uuid.UUID, db: DbSession) -> Response:
    service = get_one(quote_id, service_id, db)
    try:
        delete_hotel_service(db, service)
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)
