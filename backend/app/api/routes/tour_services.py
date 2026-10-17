import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.tour_service import TourServiceCreate, TourServiceRead, TourServiceUpdate
from app.services import BusinessRuleError, ConflictError, ResourceNotFoundError
from app.services.tour_service_service import create_tour_service, delete_tour_service, get_tour_service, list_tour_services, update_tour_service


router = APIRouter(prefix="/quotes/{quote_id}/tours", tags=["Tours"])
DbSession = Annotated[Session, Depends(get_db)]


def _get(quote_id: uuid.UUID, service_id: uuid.UUID, db: Session):
    try:
        service = get_tour_service(db, quote_id, service_id)
    except ResourceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    if service is None:
        raise HTTPException(status_code=404, detail="Tour no encontrado.")
    return service


@router.post("", response_model=TourServiceRead, status_code=201)
def create(payload: TourServiceCreate, quote_id: uuid.UUID, db: DbSession):
    try:
        return create_tour_service(db, quote_id, payload)
    except ResourceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.get("", response_model=list[TourServiceRead])
def list_all(quote_id: uuid.UUID, db: DbSession):
    try:
        return list_tour_services(db, quote_id)
    except ResourceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{service_id}", response_model=TourServiceRead)
def get_one(quote_id: uuid.UUID, service_id: uuid.UUID, db: DbSession):
    return _get(quote_id, service_id, db)


@router.patch("/{service_id}", response_model=TourServiceRead)
def update(payload: TourServiceUpdate, quote_id: uuid.UUID, service_id: uuid.UUID, db: DbSession):
    try:
        return update_tour_service(db, _get(quote_id, service_id, db), payload)
    except BusinessRuleError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.delete("/{service_id}", status_code=204)
def delete(quote_id: uuid.UUID, service_id: uuid.UUID, db: DbSession) -> Response:
    try:
        delete_tour_service(db, _get(quote_id, service_id, db))
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return Response(status_code=204)
