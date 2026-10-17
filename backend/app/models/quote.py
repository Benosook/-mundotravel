import enum
import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Date, DateTime, Enum, ForeignKey, Numeric, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.branch import Branch
    from app.models.client import Client
    from app.models.flight_service import FlightService
    from app.models.hotel_service import HotelService
    from app.models.passenger import Passenger
    from app.models.payment import Payment
    from app.models.payment_schedule import PaymentSchedule
    from app.models.tour_service import TourService
    from app.models.transport_service import TransportService
    from app.models.user import User


class QuoteStatus(str, enum.Enum):
    ACTIVE = "active"
    PENDING = "pending"
    PAID = "paid"
    CANCELLED = "cancelled"


class Quote(TimestampMixin, Base):
    __tablename__ = "quotes"
    __table_args__ = (
        CheckConstraint("public_price >= 0", name="ck_quotes_public_price_nonnegative"),
        CheckConstraint("net_price >= 0", name="ck_quotes_net_price_nonnegative"),
        CheckConstraint("total_paid >= 0", name="ck_quotes_total_paid_nonnegative"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    folio: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)
    client_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("clients.id", ondelete="RESTRICT"), nullable=False, index=True)
    seller_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    branch_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("branches.id", ondelete="RESTRICT"), nullable=False, index=True)
    status: Mapped[QuoteStatus] = mapped_column(
        Enum(QuoteStatus, name="quote_status", values_callable=lambda items: [item.value for item in items]),
        nullable=False, default=QuoteStatus.PENDING, index=True,
    )
    sale_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    payment_limit_date: Mapped[date | None] = mapped_column(Date)
    departure_date: Mapped[date | None] = mapped_column(Date, index=True)
    return_date: Mapped[date | None] = mapped_column(Date)
    internal_comment: Mapped[str | None] = mapped_column(Text)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, server_default=text("'MXN'"))
    public_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, server_default=text("0"))
    net_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, server_default=text("0"))
    total_paid: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, server_default=text("0"))
    remaining_balance: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, server_default=text("0"))

    client: Mapped["Client"] = relationship(back_populates="quotes")
    seller: Mapped["User | None"] = relationship(back_populates="quotes")
    branch: Mapped["Branch"] = relationship(back_populates="quotes")
    passengers: Mapped[list["Passenger"]] = relationship(back_populates="quote", cascade="all, delete-orphan")
    hotel_services: Mapped[list["HotelService"]] = relationship(back_populates="quote", cascade="all, delete-orphan")
    flight_services: Mapped[list["FlightService"]] = relationship(back_populates="quote", cascade="all, delete-orphan")
    tour_services: Mapped[list["TourService"]] = relationship(back_populates="quote", cascade="all, delete-orphan")
    transport_services: Mapped[list["TransportService"]] = relationship(back_populates="quote", cascade="all, delete-orphan")
    # Payments are financial history: PostgreSQL must reject quote deletion while they exist.
    payments: Mapped[list["Payment"]] = relationship(back_populates="quote", passive_deletes=True)
    payment_schedule: Mapped[list["PaymentSchedule"]] = relationship(back_populates="quote", cascade="all, delete-orphan")
