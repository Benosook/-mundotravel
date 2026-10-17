import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.branch import Branch
    from app.models.payment import Payment
    from app.models.quote import Quote


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)
    branch_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("branches.id", ondelete="SET NULL"), index=True)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))

    branch: Mapped["Branch | None"] = relationship(back_populates="users")
    quotes: Mapped[list["Quote"]] = relationship(back_populates="seller")
    payments: Mapped[list["Payment"]] = relationship(back_populates="user")
