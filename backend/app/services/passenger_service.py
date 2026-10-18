import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.passenger import Passenger
from app.models.quote import Quote
from app.schemas.passenger import PassengerCreate, PassengerUpdate
from app.services import ResourceNotFoundError


def _require_quote(db: Session, quote_id: uuid.UUID) -> None:
    if db.get(Quote, quote_id) is None:
        raise ResourceNotFoundError("Cotización no encontrada.")


def list_passengers(db: Session, quote_id: uuid.UUID) -> list[Passenger]:
    _require_quote(db, quote_id)
    return list(db.scalars(select(Passenger).where(Passenger.quote_id == quote_id).order_by(Passenger.created_at)))


def get_passenger(db: Session, quote_id: uuid.UUID, passenger_id: uuid.UUID) -> Passenger | None:
    _require_quote(db, quote_id)
    return db.scalar(select(Passenger).where(Passenger.quote_id == quote_id, Passenger.id == passenger_id))


def create_passenger(db: Session, quote_id: uuid.UUID, payload: PassengerCreate) -> Passenger:
    _require_quote(db, quote_id)
    passenger = Passenger(quote_id=quote_id, **payload.model_dump())
    db.add(passenger)
    db.commit()
    db.refresh(passenger)
    return passenger


def update_passenger(db: Session, passenger: Passenger, payload: PassengerUpdate) -> Passenger:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(passenger, field, value)
    db.commit()
    db.refresh(passenger)
    return passenger


def delete_passenger(db: Session, passenger: Passenger) -> None:
    db.delete(passenger)
    db.commit()
