import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Enum, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.quote import Quote


class ClientStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class Client(TimestampMixin, Base):
    __tablename__ = "clients"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(255), index=True)
    notes: Mapped[str | None] = mapped_column(Text)
    status: Mapped[ClientStatus] = mapped_column(
        Enum(ClientStatus, name="client_status", values_callable=lambda items: [item.value for item in items]),
        nullable=False,
        default=ClientStatus.ACTIVE,
    )

    quotes: Mapped[list["Quote"]] = relationship(back_populates="client")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()
