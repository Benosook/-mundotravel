import uuid
from datetime import datetime
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator, model_validator


RequiredText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]
Money = Annotated[Decimal, Field(ge=0, max_digits=12, decimal_places=2)]


class TourServiceCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    purchase_method: RequiredText = Field(max_length=80)
    name: RequiredText = Field(max_length=200)
    start_datetime: datetime
    cancellation_date: datetime | None = None
    operator: str | None = Field(default=None, max_length=150)
    operator_code: str | None = Field(default=None, max_length=100)
    comments: str | None = None
    net_price: Money
    public_price: Money

    @field_validator("operator", "operator_code", "comments")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None

    @model_validator(mode="after")
    def validate_cancellation(self) -> "TourServiceCreate":
        if self.cancellation_date and self.cancellation_date > self.start_datetime:
            raise ValueError("cancellation_date cannot be after start_datetime")
        return self


class TourServiceUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    purchase_method: RequiredText | None = Field(default=None, max_length=80)
    name: RequiredText | None = Field(default=None, max_length=200)
    start_datetime: datetime | None = None
    cancellation_date: datetime | None = None
    operator: str | None = Field(default=None, max_length=150)
    operator_code: str | None = Field(default=None, max_length=100)
    comments: str | None = None
    net_price: Money | None = None
    public_price: Money | None = None

    @field_validator("operator", "operator_code", "comments")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


class TourServiceRead(TourServiceCreate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    quote_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
