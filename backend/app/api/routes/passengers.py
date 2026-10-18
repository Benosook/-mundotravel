import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.passenger import PassengerCreate, PassengerRead, PassengerUpdate
from app.services import ResourceNotFoundError
from app.services.passenger_service import create_passenger, delete_passenger, get_passenger, list_passengers, update_passenger


router = APIRouter(prefix="/quotes/{quote_id}/passengers", tags=["Passengers"])
DbSession = Annotated[Session, Depends(get_db)]


def _get(quote_id: uuid.UUID, passenger_id: uuid.UUID, db: Session):
    try:
        passenger = get_passenger(db, quote_id, passenger_id)
    except ResourceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    if passenger is None:
        raise HTTPException(status_code=404, detail="Acompañante no encontrado.")
    return passenger


@router.get("", response_model=list[PassengerRead])
def list_all(quote_id: uuid.UUID, db: DbSession):
    try:
        return list_passengers(db, quote_id)
    except ResourceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("", response_model=PassengerRead, status_code=201)
def create(payload: PassengerCreate, quote_id: uuid.UUID, db: DbSession):
    try:
        return create_passenger(db, quote_id, payload)
    except ResourceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.patch("/{passenger_id}", response_model=PassengerRead)
def update(payload: PassengerUpdate, quote_id: uuid.UUID, passenger_id: uuid.UUID, db: DbSession):
    return update_passenger(db, _get(quote_id, passenger_id, db), payload)


@router.delete("/{passenger_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(quote_id: uuid.UUID, passenger_id: uuid.UUID, db: DbSession) -> Response:
    delete_passenger(db, _get(quote_id, passenger_id, db))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
