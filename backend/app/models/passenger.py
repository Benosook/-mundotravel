import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.quote import Quote


class PassengerType(str, enum.Enum):
    ADULT = "adult"
    MINOR = "minor"


class Passenger(TimestampMixin, Base):
    __tablename__ = "passengers"
    __table_args__ = (CheckConstraint("age >= 0", name="ck_passengers_age_nonnegative"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quote_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("quotes.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    age: Mapped[int] = mapped_column(nullable=False)
    passenger_type: Mapped[PassengerType] = mapped_column(
        Enum(PassengerType, name="passenger_type", values_callable=lambda items: [item.value for item in items]), nullable=False
    )

    quote: Mapped["Quote"] = relationship(back_populates="passengers")
