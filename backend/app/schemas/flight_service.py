import uuid
from datetime import datetime
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator, model_validator

from app.models.flight_service import FlightTripType


RequiredText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]
Money = Annotated[Decimal, Field(ge=0, max_digits=12, decimal_places=2)]


class FlightServiceCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    purchase_method: RequiredText = Field(max_length=80)
    trip_type: FlightTripType
    origin: RequiredText = Field(max_length=200)
    destination: RequiredText = Field(max_length=200)
    departure_datetime: datetime
    return_datetime: datetime | None = None
    airline: RequiredText = Field(max_length=150)
    outbound_flight_number: RequiredText = Field(max_length=50)
    return_flight_number: str | None = Field(default=None, max_length=50)
    operator: str | None = Field(default=None, max_length=150)
    operator_code: str | None = Field(default=None, max_length=100)
    comments: str | None = None
    net_price: Money
    public_price: Money

    @field_validator("return_flight_number", "operator", "operator_code", "comments")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None

    @model_validator(mode="after")
    def validate_trip(self) -> "FlightServiceCreate":
        if self.trip_type == FlightTripType.ROUND:
            if self.return_datetime is None:
                raise ValueError("return_datetime is required for a round trip")
            if not self.return_flight_number:
                raise ValueError("return_flight_number is required for a round trip")
            if self.return_datetime < self.departure_datetime:
                raise ValueError("return_datetime cannot be before departure_datetime")
        elif self.return_datetime is not None or self.return_flight_number is not None:
            raise ValueError("return data must be empty for a one-way trip")
        return self


class FlightServiceUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    purchase_method: RequiredText | None = Field(default=None, max_length=80)
    trip_type: FlightTripType | None = None
    origin: RequiredText | None = Field(default=None, max_length=200)
    destination: RequiredText | None = Field(default=None, max_length=200)
    departure_datetime: datetime | None = None
    return_datetime: datetime | None = None
    airline: RequiredText | None = Field(default=None, max_length=150)
    outbound_flight_number: RequiredText | None = Field(default=None, max_length=50)
    return_flight_number: str | None = Field(default=None, max_length=50)
    operator: str | None = Field(default=None, max_length=150)
    operator_code: str | None = Field(default=None, max_length=100)
    comments: str | None = None
    net_price: Money | None = None
    public_price: Money | None = None

    @field_validator("return_flight_number", "operator", "operator_code", "comments")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


class FlightServiceRead(FlightServiceCreate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    quote_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
