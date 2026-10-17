import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator, model_validator


RequiredText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]
Money = Annotated[Decimal, Field(ge=0, max_digits=12, decimal_places=2)]


class HotelServiceCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    purchase_method: RequiredText = Field(max_length=80)
    hotel_name: RequiredText = Field(max_length=200)
    check_in: date
    check_out: date
    plan: RequiredText = Field(max_length=100)
    rooms: int = Field(ge=1)
    operator: str | None = Field(default=None, max_length=150)
    reservation_code: str | None = Field(default=None, max_length=100)
    cancellation_date: date | None = None
    comments: str | None = None
    net_price: Money
    public_price: Money

    @field_validator("operator", "reservation_code", "comments")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None

    @model_validator(mode="after")
    def validate_dates(self) -> "HotelServiceCreate":
        if self.check_out < self.check_in:
            raise ValueError("check_out must be on or after check_in")
        return self


class HotelServiceUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    purchase_method: RequiredText | None = Field(default=None, max_length=80)
    hotel_name: RequiredText | None = Field(default=None, max_length=200)
    check_in: date | None = None
    check_out: date | None = None
    plan: RequiredText | None = Field(default=None, max_length=100)
    rooms: int | None = Field(default=None, ge=1)
    operator: str | None = Field(default=None, max_length=150)
    reservation_code: str | None = Field(default=None, max_length=100)
    cancellation_date: date | None = None
    comments: str | None = None
    net_price: Money | None = None
    public_price: Money | None = None

    @field_validator("operator", "reservation_code", "comments")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


class HotelServiceRead(HotelServiceCreate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    quote_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
