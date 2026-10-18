import uuid
from decimal import Decimal

from pydantic import ValidationError
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.payment import Payment, PaymentStatus
from app.schemas.payment import PaymentCreate, PaymentUpdate
from app.services import BusinessRuleError, ConflictError
from app.services.quote_totals_service import (
    ZERO, ensure_quote_exists, get_quote_for_update, recalculate_quote_financials,
)


FIELDS = tuple(PaymentCreate.model_fields)


def _confirmed_total_excluding(db: Session, quote_id: uuid.UUID, payment_id: uuid.UUID | None = None) -> Decimal:
    statement = select(func.coalesce(func.sum(Payment.amount), ZERO)).where(
        Payment.quote_id == quote_id,
        Payment.status == PaymentStatus.CONFIRMED,
    )
    if payment_id is not None:
        statement = statement.where(Payment.id != payment_id)
    return Decimal(db.scalar(statement))


def _validate_confirmed_amount(public_price: Decimal, other_confirmed: Decimal, candidate: PaymentCreate) -> None:
    if candidate.status != PaymentStatus.CONFIRMED:
        return
    available = max(public_price - other_confirmed, ZERO)
    if available == ZERO:
        raise BusinessRuleError("La cotización no tiene saldo pendiente para recibir un abono confirmado.")
    if candidate.amount > available:
        raise BusinessRuleError(f"El abono confirmado supera el saldo disponible de {available:.2f} MXN.")


def create_payment(db: Session, quote_id: uuid.UUID, data: PaymentCreate, user_id: uuid.UUID) -> Payment:
    quote = get_quote_for_update(db, quote_id)
    recalculate_quote_financials(db, quote)
    _validate_confirmed_amount(quote.public_price, quote.total_paid, data)

    payment = Payment(quote_id=quote_id, user_id=user_id, **data.model_dump())
    db.add(payment)
    try:
        db.flush()
        recalculate_quote_financials(db, quote)
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("No fue posible guardar el abono.") from exc
    db.refresh(payment)
    return payment


def get_payment(db: Session, quote_id: uuid.UUID, payment_id: uuid.UUID) -> Payment | None:
    ensure_quote_exists(db, quote_id)
    return db.scalar(select(Payment).where(Payment.id == payment_id, Payment.quote_id == quote_id))


def list_payments(db: Session, quote_id: uuid.UUID) -> list[Payment]:
    ensure_quote_exists(db, quote_id)
    statement = select(Payment).where(Payment.quote_id == quote_id).order_by(Payment.date.desc(), Payment.created_at.desc())
    return list(db.scalars(statement).all())


def update_payment(db: Session, payment: Payment, data: PaymentUpdate) -> Payment:
    quote = get_quote_for_update(db, payment.quote_id)
    recalculate_quote_financials(db, quote)
    merged = {field: getattr(payment, field) for field in FIELDS}
    merged.update(data.model_dump(exclude_unset=True))
    try:
        candidate = PaymentCreate.model_validate(merged)
    except ValidationError as exc:
        raise BusinessRuleError(str(exc)) from exc

    other_confirmed = _confirmed_total_excluding(db, payment.quote_id, payment.id)
    _validate_confirmed_amount(quote.public_price, other_confirmed, candidate)
    for field, value in candidate.model_dump().items():
        setattr(payment, field, value)
    try:
        db.flush()
        recalculate_quote_financials(db, quote)
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("No fue posible actualizar el abono.") from exc
    db.refresh(payment)
    return payment
