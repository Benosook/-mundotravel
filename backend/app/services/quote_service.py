import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import Select, func, or_, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.branch import Branch
from app.models.client import Client
from app.models.quote import Quote, QuoteStatus
from app.models.user import User
from app.schemas.quote import QuoteCreate, QuoteUpdate
from app.services import BusinessRuleError, ConflictError, ResourceNotFoundError


ZERO = Decimal("0.00")


def _get_related(db: Session, model: type[Client] | type[User] | type[Branch], object_id: uuid.UUID, label: str):
    instance = db.get(model, object_id)
    if instance is None:
        raise ResourceNotFoundError(f"{label} no existe.")
    return instance


def _generate_folio(db: Session) -> str:
    # A PostgreSQL sequence is concurrency-safe; unlike COUNT(), each request gets a unique value.
    return db.execute(
        text(
            "SELECT 'MT-' || to_char(CURRENT_DATE, 'YYYY') || '-' || "
            "lpad(nextval('quote_folio_seq')::text, 6, '0')"
        )
    ).scalar_one()


def _validate_dates(
    *, payment_limit_date: date | None, departure_date: date | None, return_date: date | None
) -> None:
    if departure_date and return_date and return_date < departure_date:
        raise BusinessRuleError("La fecha de regreso no puede ser anterior a la salida.")
    if payment_limit_date and departure_date and payment_limit_date > departure_date:
        raise BusinessRuleError("La fecha límite de pago no puede ser posterior a la salida.")


def create_quote(db: Session, data: QuoteCreate) -> Quote:
    _get_related(db, Client, data.client_id, "El cliente")
    _get_related(db, User, data.seller_id, "El vendedor")
    _get_related(db, Branch, data.branch_id, "La sucursal")

    quote = Quote(
        **data.model_dump(),
        folio=_generate_folio(db),
        public_price=ZERO,
        net_price=ZERO,
        total_paid=ZERO,
        remaining_balance=ZERO,
    )
    db.add(quote)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("No fue posible crear la cotización con esos datos.") from exc
    return get_quote(db, quote.id)  # type: ignore[return-value]


def get_quote(db: Session, quote_id: uuid.UUID) -> Quote | None:
    statement = (
        select(Quote)
        .where(Quote.id == quote_id)
        .options(
            joinedload(Quote.client),
            joinedload(Quote.seller),
            joinedload(Quote.branch),
            selectinload(Quote.hotel_services),
            selectinload(Quote.tour_services),
            selectinload(Quote.transport_services),
            selectinload(Quote.flight_services),
            selectinload(Quote.payments),
            selectinload(Quote.payment_schedule),
        )
    )
    return db.scalar(statement)


def list_quotes(
    db: Session,
    *,
    search: str | None = None,
    status: QuoteStatus | None = None,
    client_id: uuid.UUID | None = None,
    seller_id: uuid.UUID | None = None,
    branch_id: uuid.UUID | None = None,
    departure_from: date | None = None,
    departure_to: date | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[Quote]:
    statement: Select[tuple[Quote]] = (
        select(Quote)
        .join(Quote.client)
        .options(joinedload(Quote.client), joinedload(Quote.seller), joinedload(Quote.branch))
    )
    if search and (term := search.strip()):
        pattern = f"%{term}%"
        statement = statement.where(
            or_(Quote.folio.ilike(pattern), Client.first_name.ilike(pattern), Client.last_name.ilike(pattern))
        )
    if status is not None:
        statement = statement.where(Quote.status == status)
    if client_id is not None:
        statement = statement.where(Quote.client_id == client_id)
    if seller_id is not None:
        statement = statement.where(Quote.seller_id == seller_id)
    if branch_id is not None:
        statement = statement.where(Quote.branch_id == branch_id)
    if departure_from is not None:
        statement = statement.where(Quote.departure_date >= departure_from)
    if departure_to is not None:
        statement = statement.where(Quote.departure_date <= departure_to)
    statement = statement.order_by(Quote.created_at.desc()).limit(limit).offset(offset)
    return list(db.scalars(statement).unique().all())


def update_quote(db: Session, quote: Quote, data: QuoteUpdate) -> Quote:
    changes = data.model_dump(exclude_unset=True)
    for required_field in ("client_id", "branch_id", "departure_date", "return_date", "status"):
        if required_field in changes and changes[required_field] is None:
            raise BusinessRuleError(f"{required_field} no puede ser nulo.")

    if "client_id" in changes:
        _get_related(db, Client, changes["client_id"], "El cliente")
    if changes.get("seller_id") is not None:
        _get_related(db, User, changes["seller_id"], "El vendedor")
    if "branch_id" in changes:
        _get_related(db, Branch, changes["branch_id"], "La sucursal")

    _validate_dates(
        payment_limit_date=changes.get("payment_limit_date", quote.payment_limit_date),
        departure_date=changes.get("departure_date", quote.departure_date),
        return_date=changes.get("return_date", quote.return_date),
    )
    for field, value in changes.items():
        setattr(quote, field, value)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("No fue posible actualizar la cotización con esos datos.") from exc
    return get_quote(db, quote.id)  # type: ignore[return-value]
