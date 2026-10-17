import uuid
from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, Field, StringConstraints, field_validator

from app.models.client import ClientStatus


RequiredText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class ClientCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    first_name: RequiredText = Field(max_length=100)
    last_name: RequiredText = Field(max_length=100)
    phone: RequiredText = Field(max_length=30)
    email: EmailStr | None = None
    notes: str | None = None

    @field_validator("notes")
    @classmethod
    def normalize_notes(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip() or None


class ClientUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    first_name: RequiredText | None = Field(default=None, max_length=100)
    last_name: RequiredText | None = Field(default=None, max_length=100)
    phone: RequiredText | None = Field(default=None, max_length=30)
    email: EmailStr | None = None
    notes: str | None = None
    status: ClientStatus | None = None

    @field_validator("notes")
    @classmethod
    def normalize_notes(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip() or None


class ClientRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    first_name: str
    last_name: str
    full_name: str
    phone: str
    email: EmailStr | None
    notes: str | None
    status: ClientStatus
    created_at: datetime
    updated_at: datetime
