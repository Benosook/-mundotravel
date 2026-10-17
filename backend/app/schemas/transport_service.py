import uuid
from datetime import datetime
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator, model_validator

from app.models.transport_service import TransportTripType


RequiredText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]
Money = Annotated[Decimal, Field(ge=0, max_digits=12, decimal_places=2)]


class TransportServiceCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    purchase_method: RequiredText = Field(max_length=80)
    transport_type: RequiredText = Field(max_length=80)
    trip_type: TransportTripType
    origin: RequiredText = Field(max_length=200)
    destination: RequiredText = Field(max_length=200)
    departure_datetime: datetime
    return_datetime: datetime | None = None
    operator: str | None = Field(default=None, max_length=150)
    operator_code: str | None = Field(default=None, max_length=100)
    cancellation_date: datetime | None = None
    comments: str | None = None
    net_price: Money
    public_price: Money

    @field_validator("operator", "operator_code", "comments")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None

    @model_validator(mode="after")
    def validate_trip(self) -> "TransportServiceCreate":
        if self.trip_type == TransportTripType.ROUND:
            if self.return_datetime is None:
                raise ValueError("return_datetime is required for a round trip")
            if self.return_datetime < self.departure_datetime:
                raise ValueError("return_datetime cannot be before departure_datetime")
        elif self.return_datetime is not None:
            raise ValueError("return_datetime must be empty for a one-way trip")
        if self.cancellation_date and self.cancellation_date > self.departure_datetime:
            raise ValueError("cancellation_date cannot be after departure_datetime")
        return self


class TransportServiceUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    purchase_method: RequiredText | None = Field(default=None, max_length=80)
    transport_type: RequiredText | None = Field(default=None, max_length=80)
    trip_type: TransportTripType | None = None
    origin: RequiredText | None = Field(default=None, max_length=200)
    destination: RequiredText | None = Field(default=None, max_length=200)
    departure_datetime: datetime | None = None
    return_datetime: datetime | None = None
    operator: str | None = Field(default=None, max_length=150)
    operator_code: str | None = Field(default=None, max_length=100)
    cancellation_date: datetime | None = None
    comments: str | None = None
    net_price: Money | None = None
    public_price: Money | None = None

    @field_validator("operator", "operator_code", "comments")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


class TransportServiceRead(TransportServiceCreate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    quote_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
