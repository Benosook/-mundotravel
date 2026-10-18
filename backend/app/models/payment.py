import enum
import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, Numeric, String, Text, func, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.quote import Quote
    from app.models.user import User


class PaymentType(str, enum.Enum):
    CASH = "cash"
    TRANSFER = "transfer"
    CARD = "card"
    OTHER = "other"


class PaymentStatus(str, enum.Enum):
    CONFIRMED = "confirmed"
    PENDING = "pending"
    CANCELLED = "cancelled"


class Payment(TimestampMixin, Base):
    __tablename__ = "payments"
    __table_args__ = (CheckConstraint("amount >= 0", name="ck_payments_amount_nonnegative"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quote_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("quotes.id", ondelete="RESTRICT"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    payment_type: Mapped[PaymentType] = mapped_column(
        Enum(PaymentType, name="payment_type", values_callable=lambda items: [item.value for item in items]), nullable=False
    )
    currency: Mapped[str] = mapped_column(String(3), nullable=False, server_default=text("'MXN'"))
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, name="payment_status", values_callable=lambda items: [item.value for item in items]), nullable=False
    )
    comment: Mapped[str | None] = mapped_column(Text)

    quote: Mapped["Quote"] = relationship(back_populates="payments")
    user: Mapped["User | None"] = relationship(back_populates="payments")

    @property
    def user_name(self) -> str | None:
        return self.user.name if self.user else None
