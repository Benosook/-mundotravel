import uuid

from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.flight_service import FlightService
from app.schemas.flight_service import FlightServiceCreate, FlightServiceUpdate
from app.services import BusinessRuleError, ConflictError
from app.services.quote_totals_service import ensure_quote_exists, get_quote_for_update, recalculate_quote_totals


FIELDS = tuple(FlightServiceCreate.model_fields)


def create_flight_service(db: Session, quote_id: uuid.UUID, data: FlightServiceCreate) -> FlightService:
    quote = get_quote_for_update(db, quote_id)
    service = FlightService(quote_id=quote_id, **data.model_dump())
    db.add(service)
    try:
        db.flush()
        recalculate_quote_totals(db, quote)
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("No fue posible guardar el vuelo.") from exc
    db.refresh(service)
    return service


def get_flight_service(db: Session, quote_id: uuid.UUID, service_id: uuid.UUID) -> FlightService | None:
    ensure_quote_exists(db, quote_id)
    return db.scalar(select(FlightService).where(FlightService.id == service_id, FlightService.quote_id == quote_id))


def list_flight_services(db: Session, quote_id: uuid.UUID) -> list[FlightService]:
    ensure_quote_exists(db, quote_id)
    return list(db.scalars(select(FlightService).where(FlightService.quote_id == quote_id).order_by(FlightService.created_at)).all())


def update_flight_service(db: Session, service: FlightService, data: FlightServiceUpdate) -> FlightService:
    quote = get_quote_for_update(db, service.quote_id)
    merged = {field: getattr(service, field) for field in FIELDS}
    merged.update(data.model_dump(exclude_unset=True))
    try:
        validated = FlightServiceCreate.model_validate(merged)
    except ValidationError as exc:
        raise BusinessRuleError(str(exc)) from exc
    for field, value in validated.model_dump().items():
        setattr(service, field, value)
    try:
        db.flush()
        recalculate_quote_totals(db, quote)
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("No fue posible actualizar el vuelo.") from exc
    db.refresh(service)
    return service


def delete_flight_service(db: Session, service: FlightService) -> None:
    quote = get_quote_for_update(db, service.quote_id)
    try:
        db.delete(service)
        db.flush()
        recalculate_quote_totals(db, quote)
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("No fue posible eliminar el vuelo.") from exc
