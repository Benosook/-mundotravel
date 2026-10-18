import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.passenger import PassengerType


class PassengerCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=200)
    age: int = Field(ge=0, le=120)
    passenger_type: PassengerType


class PassengerUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1, max_length=200)
    age: int | None = Field(default=None, ge=0, le=120)
    passenger_type: PassengerType | None = None


class PassengerRead(PassengerCreate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    quote_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
