import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from app.models.payment_schedule import PaymentScheduleStatus


NonNegativeMoney = Annotated[Decimal, Field(ge=0, max_digits=12, decimal_places=2)]


class PaymentScheduleCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    installment_number: int = Field(ge=1)
    due_date: date
    amount: NonNegativeMoney
    status: PaymentScheduleStatus = PaymentScheduleStatus.PENDING


class PaymentScheduleUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    installment_number: int | None = Field(default=None, ge=1)
    due_date: date | None = None
    amount: NonNegativeMoney | None = None
    status: PaymentScheduleStatus | None = None


class PaymentScheduleRead(PaymentScheduleCreate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    quote_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
