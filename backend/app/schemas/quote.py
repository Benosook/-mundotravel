import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from app.models.quote import QuoteStatus
from app.schemas.flight_service import FlightServiceRead
from app.schemas.hotel_service import HotelServiceRead
from app.schemas.tour_service import TourServiceRead
from app.schemas.transport_service import TransportServiceRead
from app.schemas.payment import PaymentRead
from app.schemas.payment_schedule import PaymentScheduleRead


class ClientSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    phone: str
    email: EmailStr | None


class SellerSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str


class BranchSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str


class QuoteDatesMixin(BaseModel):
    payment_limit_date: date | None = None
    departure_date: date
    return_date: date

    @model_validator(mode="after")
    def validate_dates(self) -> "QuoteDatesMixin":
        if self.return_date < self.departure_date:
            raise ValueError("return_date must be on or after departure_date")
        if self.payment_limit_date and self.payment_limit_date > self.departure_date:
            raise ValueError("payment_limit_date cannot be after departure_date")
        return self


class QuoteCreate(QuoteDatesMixin):
    model_config = ConfigDict(extra="forbid")

    client_id: uuid.UUID
    seller_id: uuid.UUID
    branch_id: uuid.UUID
    status: QuoteStatus = QuoteStatus.PENDING
    sale_date: datetime
    internal_comment: str | None = None
    currency: str = Field(default="MXN", min_length=3, max_length=3)

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        return value.strip().upper()

    @field_validator("internal_comment")
    @classmethod
    def normalize_comment(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


class QuoteUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    client_id: uuid.UUID | None = None
    seller_id: uuid.UUID | None = None
    branch_id: uuid.UUID | None = None
    status: QuoteStatus | None = None
    sale_date: datetime | None = None
    payment_limit_date: date | None = None
    departure_date: date | None = None
    return_date: date | None = None
    internal_comment: str | None = None

    @field_validator("internal_comment")
    @classmethod
    def normalize_comment(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


class QuoteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    folio: str
    client_id: uuid.UUID
    seller_id: uuid.UUID | None
    branch_id: uuid.UUID
    status: QuoteStatus
    sale_date: datetime | None
    payment_limit_date: date | None
    departure_date: date | None
    return_date: date | None
    internal_comment: str | None
    currency: str
    public_price: Decimal
    net_price: Decimal
    total_paid: Decimal
    remaining_balance: Decimal
    client: ClientSummary
    seller: SellerSummary | None
    branch: BranchSummary
    hotels: list[HotelServiceRead] = Field(validation_alias="hotel_services")
    tours: list[TourServiceRead] = Field(validation_alias="tour_services")
    transports: list[TransportServiceRead] = Field(validation_alias="transport_services")
    flights: list[FlightServiceRead] = Field(validation_alias="flight_services")
    payments: list[PaymentRead]
    payment_schedule: list[PaymentScheduleRead]
    created_at: datetime
    updated_at: datetime


class QuoteListItem(BaseModel):
    id: uuid.UUID
    folio: str
    client_id: uuid.UUID
    client_name: str
    seller_id: uuid.UUID | None
    seller_name: str | None
    branch_id: uuid.UUID
    branch_name: str
    status: QuoteStatus
    sale_date: datetime | None
    departure_date: date | None
    return_date: date | None
    currency: str
    public_price: Decimal
    net_price: Decimal
    total_paid: Decimal
    remaining_balance: Decimal
    created_at: datetime
