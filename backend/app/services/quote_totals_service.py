import uuid
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.flight_service import FlightService
from app.models.hotel_service import HotelService
from app.models.payment import Payment, PaymentStatus
from app.models.quote import Quote
from app.models.tour_service import TourService
from app.models.transport_service import TransportService
from app.services import ResourceNotFoundError


ZERO = Decimal("0.00")
SERVICE_MODELS = (HotelService, TourService, TransportService, FlightService)


def get_quote_for_update(db: Session, quote_id: uuid.UUID) -> Quote:
    quote = db.scalar(select(Quote).where(Quote.id == quote_id).with_for_update())
    if quote is None:
        raise ResourceNotFoundError("Cotización no encontrada.")
    return quote


def ensure_quote_exists(db: Session, quote_id: uuid.UUID) -> None:
    if db.scalar(select(Quote.id).where(Quote.id == quote_id)) is None:
        raise ResourceNotFoundError("Cotización no encontrada.")


def recalculate_quote_financials(db: Session, quote: Quote) -> None:
    net_total = ZERO
    public_total = ZERO
    for model in SERVICE_MODELS:
        net_value, public_value = db.execute(
            select(
                func.coalesce(func.sum(model.net_price), ZERO),
                func.coalesce(func.sum(model.public_price), ZERO),
            ).where(model.quote_id == quote.id)
        ).one()
        net_total += Decimal(net_value)
        public_total += Decimal(public_value)

    paid_value = db.scalar(
        select(func.coalesce(func.sum(Payment.amount), ZERO)).where(
            Payment.quote_id == quote.id,
            Payment.status == PaymentStatus.CONFIRMED,
        )
    )
    total_paid = Decimal(paid_value)

    quote.net_price = net_total
    quote.public_price = public_total
    quote.total_paid = total_paid
    quote.remaining_balance = max(public_total - total_paid, ZERO)
    db.flush()


def recalculate_quote_totals(db: Session, quote: Quote) -> None:
    """Backward-compatible name used by travel-service operations."""
    recalculate_quote_financials(db, quote)
