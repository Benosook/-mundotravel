import enum
import uuid
from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Date, Enum, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.quote import Quote


class PaymentScheduleStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"


class PaymentSchedule(TimestampMixin, Base):
    __tablename__ = "payment_schedules"
    __table_args__ = (
        CheckConstraint("installment_number >= 1", name="ck_payment_schedules_installment_positive"),
        CheckConstraint("amount >= 0", name="ck_payment_schedules_amount_nonnegative"),
        UniqueConstraint("quote_id", "installment_number", name="uq_payment_schedules_quote_installment"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quote_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("quotes.id", ondelete="CASCADE"), nullable=False, index=True)
    installment_number: Mapped[int] = mapped_column(nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[PaymentScheduleStatus] = mapped_column(
        Enum(PaymentScheduleStatus, name="payment_schedule_status", values_callable=lambda items: [item.value for item in items]), nullable=False
    )

    quote: Mapped["Quote"] = relationship(back_populates="payment_schedule")
