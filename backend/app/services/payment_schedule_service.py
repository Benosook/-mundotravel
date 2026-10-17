import uuid

from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.payment_schedule import PaymentSchedule
from app.schemas.payment_schedule import PaymentScheduleCreate, PaymentScheduleUpdate
from app.services import BusinessRuleError, ConflictError
from app.services.quote_totals_service import ensure_quote_exists, get_quote_for_update


FIELDS = tuple(PaymentScheduleCreate.model_fields)


def create_payment_schedule(db: Session, quote_id: uuid.UUID, data: PaymentScheduleCreate) -> PaymentSchedule:
    get_quote_for_update(db, quote_id)
    schedule = PaymentSchedule(quote_id=quote_id, **data.model_dump())
    db.add(schedule)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("Ya existe ese número de anticipo para la cotización.") from exc
    db.refresh(schedule)
    return schedule


def get_payment_schedule(db: Session, quote_id: uuid.UUID, schedule_id: uuid.UUID) -> PaymentSchedule | None:
    ensure_quote_exists(db, quote_id)
    return db.scalar(
        select(PaymentSchedule).where(PaymentSchedule.id == schedule_id, PaymentSchedule.quote_id == quote_id)
    )


def list_payment_schedules(db: Session, quote_id: uuid.UUID) -> list[PaymentSchedule]:
    ensure_quote_exists(db, quote_id)
    statement = (
        select(PaymentSchedule)
        .where(PaymentSchedule.quote_id == quote_id)
        .order_by(PaymentSchedule.installment_number)
    )
    return list(db.scalars(statement).all())


def update_payment_schedule(
    db: Session, schedule: PaymentSchedule, data: PaymentScheduleUpdate
) -> PaymentSchedule:
    get_quote_for_update(db, schedule.quote_id)
    merged = {field: getattr(schedule, field) for field in FIELDS}
    merged.update(data.model_dump(exclude_unset=True))
    try:
        candidate = PaymentScheduleCreate.model_validate(merged)
    except ValidationError as exc:
        raise BusinessRuleError(str(exc)) from exc
    for field, value in candidate.model_dump().items():
        setattr(schedule, field, value)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("Ya existe ese número de anticipo para la cotización.") from exc
    db.refresh(schedule)
    return schedule


def delete_payment_schedule(db: Session, schedule: PaymentSchedule) -> None:
    get_quote_for_update(db, schedule.quote_id)
    try:
        db.delete(schedule)
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("No fue posible eliminar el anticipo programado.") from exc
