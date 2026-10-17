import enum
import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.quote import Quote


class FlightTripType(str, enum.Enum):
    ROUND = "round"
    ONE_WAY = "one-way"


class FlightService(TimestampMixin, Base):
    __tablename__ = "flight_services"
    __table_args__ = (
        CheckConstraint("net_price >= 0", name="ck_flight_services_net_price_nonnegative"),
        CheckConstraint("public_price >= 0", name="ck_flight_services_public_price_nonnegative"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quote_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("quotes.id", ondelete="CASCADE"), nullable=False, index=True)
    purchase_method: Mapped[str] = mapped_column(String(80), nullable=False)
    trip_type: Mapped[FlightTripType] = mapped_column(
        Enum(FlightTripType, name="flight_trip_type", values_callable=lambda items: [item.value for item in items]), nullable=False
    )
    origin: Mapped[str] = mapped_column(String(200), nullable=False)
    destination: Mapped[str] = mapped_column(String(200), nullable=False)
    departure_datetime: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    return_datetime: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    airline: Mapped[str] = mapped_column(String(150), nullable=False)
    outbound_flight_number: Mapped[str] = mapped_column(String(50), nullable=False)
    return_flight_number: Mapped[str | None] = mapped_column(String(50))
    operator: Mapped[str | None] = mapped_column(String(150))
    operator_code: Mapped[str | None] = mapped_column(String(100))
    comments: Mapped[str | None] = mapped_column(Text)
    net_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    public_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    quote: Mapped["Quote"] = relationship(back_populates="flight_services")
