import uuid

from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.hotel_service import HotelService
from app.schemas.hotel_service import HotelServiceCreate, HotelServiceUpdate
from app.services import BusinessRuleError, ConflictError
from app.services.quote_totals_service import ensure_quote_exists, get_quote_for_update, recalculate_quote_totals


FIELDS = tuple(HotelServiceCreate.model_fields)


def create_hotel_service(db: Session, quote_id: uuid.UUID, data: HotelServiceCreate) -> HotelService:
    quote = get_quote_for_update(db, quote_id)
    service = HotelService(quote_id=quote_id, **data.model_dump())
    db.add(service)
    try:
        db.flush()
        recalculate_quote_totals(db, quote)
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("No fue posible guardar el hotel.") from exc
    db.refresh(service)
    return service


def get_hotel_service(db: Session, quote_id: uuid.UUID, service_id: uuid.UUID) -> HotelService | None:
    ensure_quote_exists(db, quote_id)
    return db.scalar(select(HotelService).where(HotelService.id == service_id, HotelService.quote_id == quote_id))


def list_hotel_services(db: Session, quote_id: uuid.UUID) -> list[HotelService]:
    ensure_quote_exists(db, quote_id)
    return list(db.scalars(select(HotelService).where(HotelService.quote_id == quote_id).order_by(HotelService.created_at)).all())


def update_hotel_service(db: Session, service: HotelService, data: HotelServiceUpdate) -> HotelService:
    quote = get_quote_for_update(db, service.quote_id)
    merged = {field: getattr(service, field) for field in FIELDS}
    merged.update(data.model_dump(exclude_unset=True))
    try:
        validated = HotelServiceCreate.model_validate(merged)
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
        raise ConflictError("No fue posible actualizar el hotel.") from exc
    db.refresh(service)
    return service


def delete_hotel_service(db: Session, service: HotelService) -> None:
    quote = get_quote_for_update(db, service.quote_id)
    try:
        db.delete(service)
        db.flush()
        recalculate_quote_totals(db, quote)
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("No fue posible eliminar el hotel.") from exc
