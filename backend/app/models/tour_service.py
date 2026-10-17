import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.quote import Quote


class TourService(TimestampMixin, Base):
    __tablename__ = "tour_services"
    __table_args__ = (
        CheckConstraint("net_price >= 0", name="ck_tour_services_net_price_nonnegative"),
        CheckConstraint("public_price >= 0", name="ck_tour_services_public_price_nonnegative"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quote_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("quotes.id", ondelete="CASCADE"), nullable=False, index=True)
    purchase_method: Mapped[str] = mapped_column(String(80), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    start_datetime: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    cancellation_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    operator: Mapped[str | None] = mapped_column(String(150))
    operator_code: Mapped[str | None] = mapped_column(String(100))
    comments: Mapped[str | None] = mapped_column(Text)
    net_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    public_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    quote: Mapped["Quote"] = relationship(back_populates="tour_services")
