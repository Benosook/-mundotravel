import uuid
from datetime import datetime
from decimal import Decimal
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.payment import PaymentStatus, PaymentType


PositiveMoney = Annotated[Decimal, Field(gt=0, max_digits=12, decimal_places=2)]


class PaymentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    date: datetime
    payment_type: PaymentType
    currency: Literal["MXN"] = "MXN"
    amount: PositiveMoney
    status: PaymentStatus = PaymentStatus.CONFIRMED
    comment: str | None = None

    @field_validator("comment")
    @classmethod
    def normalize_comment(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


class PaymentUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    date: datetime | None = None
    payment_type: PaymentType | None = None
    currency: Literal["MXN"] | None = None
    amount: PositiveMoney | None = None
    status: PaymentStatus | None = None
    comment: str | None = None

    @field_validator("comment")
    @classmethod
    def normalize_comment(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


class PaymentRead(PaymentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    quote_id: uuid.UUID
    user_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
