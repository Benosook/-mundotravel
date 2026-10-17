import uuid
from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Date, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.quote import Quote


class HotelService(TimestampMixin, Base):
    __tablename__ = "hotel_services"
    __table_args__ = (
        CheckConstraint("rooms >= 1", name="ck_hotel_services_rooms_positive"),
        CheckConstraint("net_price >= 0", name="ck_hotel_services_net_price_nonnegative"),
        CheckConstraint("public_price >= 0", name="ck_hotel_services_public_price_nonnegative"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quote_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("quotes.id", ondelete="CASCADE"), nullable=False, index=True)
    purchase_method: Mapped[str] = mapped_column(String(80), nullable=False)
    hotel_name: Mapped[str] = mapped_column(String(200), nullable=False)
    check_in: Mapped[date] = mapped_column(Date, nullable=False)
    check_out: Mapped[date] = mapped_column(Date, nullable=False)
    plan: Mapped[str] = mapped_column(String(100), nullable=False)
    rooms: Mapped[int] = mapped_column(nullable=False)
    operator: Mapped[str | None] = mapped_column(String(150))
    reservation_code: Mapped[str | None] = mapped_column(String(100))
    cancellation_date: Mapped[date | None] = mapped_column(Date)
    comments: Mapped[str | None] = mapped_column(Text)
    net_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    public_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    quote: Mapped["Quote"] = relationship(back_populates="hotel_services")
