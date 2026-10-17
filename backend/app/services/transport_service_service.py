import uuid

from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.transport_service import TransportService
from app.schemas.transport_service import TransportServiceCreate, TransportServiceUpdate
from app.services import BusinessRuleError, ConflictError
from app.services.quote_totals_service import ensure_quote_exists, get_quote_for_update, recalculate_quote_totals


FIELDS = tuple(TransportServiceCreate.model_fields)


def create_transport_service(db: Session, quote_id: uuid.UUID, data: TransportServiceCreate) -> TransportService:
    quote = get_quote_for_update(db, quote_id)
    service = TransportService(quote_id=quote_id, **data.model_dump())
    db.add(service)
    try:
        db.flush()
        recalculate_quote_totals(db, quote)
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("No fue posible guardar el transporte.") from exc
    db.refresh(service)
    return service


def get_transport_service(db: Session, quote_id: uuid.UUID, service_id: uuid.UUID) -> TransportService | None:
    ensure_quote_exists(db, quote_id)
    return db.scalar(select(TransportService).where(TransportService.id == service_id, TransportService.quote_id == quote_id))


def list_transport_services(db: Session, quote_id: uuid.UUID) -> list[TransportService]:
    ensure_quote_exists(db, quote_id)
    return list(db.scalars(select(TransportService).where(TransportService.quote_id == quote_id).order_by(TransportService.created_at)).all())


def update_transport_service(db: Session, service: TransportService, data: TransportServiceUpdate) -> TransportService:
    quote = get_quote_for_update(db, service.quote_id)
    merged = {field: getattr(service, field) for field in FIELDS}
    merged.update(data.model_dump(exclude_unset=True))
    try:
        validated = TransportServiceCreate.model_validate(merged)
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
        raise ConflictError("No fue posible actualizar el transporte.") from exc
    db.refresh(service)
    return service


def delete_transport_service(db: Session, service: TransportService) -> None:
    quote = get_quote_for_update(db, service.quote_id)
    try:
        db.delete(service)
        db.flush()
        recalculate_quote_totals(db, quote)
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("No fue posible eliminar el transporte.") from exc
