import uuid

from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.tour_service import TourService
from app.schemas.tour_service import TourServiceCreate, TourServiceUpdate
from app.services import BusinessRuleError, ConflictError
from app.services.quote_totals_service import ensure_quote_exists, get_quote_for_update, recalculate_quote_totals


FIELDS = tuple(TourServiceCreate.model_fields)


def create_tour_service(db: Session, quote_id: uuid.UUID, data: TourServiceCreate) -> TourService:
    quote = get_quote_for_update(db, quote_id)
    service = TourService(quote_id=quote_id, **data.model_dump())
    db.add(service)
    try:
        db.flush()
        recalculate_quote_totals(db, quote)
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("No fue posible guardar el tour.") from exc
    db.refresh(service)
    return service


def get_tour_service(db: Session, quote_id: uuid.UUID, service_id: uuid.UUID) -> TourService | None:
    ensure_quote_exists(db, quote_id)
    return db.scalar(select(TourService).where(TourService.id == service_id, TourService.quote_id == quote_id))


def list_tour_services(db: Session, quote_id: uuid.UUID) -> list[TourService]:
    ensure_quote_exists(db, quote_id)
    return list(db.scalars(select(TourService).where(TourService.quote_id == quote_id).order_by(TourService.created_at)).all())


def update_tour_service(db: Session, service: TourService, data: TourServiceUpdate) -> TourService:
    quote = get_quote_for_update(db, service.quote_id)
    merged = {field: getattr(service, field) for field in FIELDS}
    merged.update(data.model_dump(exclude_unset=True))
    try:
        validated = TourServiceCreate.model_validate(merged)
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
        raise ConflictError("No fue posible actualizar el tour.") from exc
    db.refresh(service)
    return service


def delete_tour_service(db: Session, service: TourService) -> None:
    quote = get_quote_for_update(db, service.quote_id)
    try:
        db.delete(service)
        db.flush()
        recalculate_quote_totals(db, quote)
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("No fue posible eliminar el tour.") from exc
