import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.quote import Quote
    from app.models.user import User


class Branch(TimestampMixin, Base):
    __tablename__ = "branches"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    code: Mapped[str | None] = mapped_column(String(30), unique=True)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))

    quotes: Mapped[list["Quote"]] = relationship(back_populates="branch")
    users: Mapped[list["User"]] = relationship(back_populates="branch")
