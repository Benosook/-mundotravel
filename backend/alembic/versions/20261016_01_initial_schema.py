"""Initial PostgreSQL schema.

Revision ID: 20261016_01
Revises:
Create Date: 2026-10-16
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20261016_01"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def timestamps() -> list[sa.Column]:
    return [
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    ]


def upgrade() -> None:
    client_status = sa.Enum("active", "inactive", name="client_status")
    quote_status = sa.Enum("active", "pending", "paid", "cancelled", name="quote_status")
    passenger_type = sa.Enum("adult", "minor", name="passenger_type")
    flight_trip_type = sa.Enum("round", "one-way", name="flight_trip_type")
    transport_trip_type = sa.Enum("round", "one-way", name="transport_trip_type")
    payment_type = sa.Enum("cash", "transfer", "card", "other", name="payment_type")
    payment_status = sa.Enum("confirmed", "pending", "cancelled", name="payment_status")
    schedule_status = sa.Enum("pending", "paid", "overdue", name="payment_schedule_status")

    op.create_table(
        "branches",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("code", sa.String(30), nullable=True),
        sa.Column("active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        *timestamps(),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
    )
    op.create_table(
        "clients",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("phone", sa.String(30), nullable=False),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("status", client_status, nullable=False),
        *timestamps(),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_clients_email", "clients", ["email"])
    op.create_index("ix_clients_phone", "clients", ["phone"])
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.String(50), nullable=False),
        sa.Column("branch_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        *timestamps(),
        sa.ForeignKeyConstraint(["branch_id"], ["branches.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_branch_id", "users", ["branch_id"])
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_table(
        "quotes",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("folio", sa.String(50), nullable=False),
        sa.Column("client_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("seller_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("branch_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("status", quote_status, nullable=False),
        sa.Column("sale_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("payment_limit_date", sa.Date(), nullable=True),
        sa.Column("departure_date", sa.Date(), nullable=True),
        sa.Column("return_date", sa.Date(), nullable=True),
        sa.Column("internal_comment", sa.Text(), nullable=True),
        sa.Column("currency", sa.String(3), server_default=sa.text("'MXN'"), nullable=False),
        sa.Column("public_price", sa.Numeric(12, 2), server_default=sa.text("0"), nullable=False),
        sa.Column("net_price", sa.Numeric(12, 2), server_default=sa.text("0"), nullable=False),
        sa.Column("total_paid", sa.Numeric(12, 2), server_default=sa.text("0"), nullable=False),
        sa.Column("remaining_balance", sa.Numeric(12, 2), server_default=sa.text("0"), nullable=False),
        *timestamps(),
        sa.CheckConstraint("net_price >= 0", name="ck_quotes_net_price_nonnegative"),
        sa.CheckConstraint("public_price >= 0", name="ck_quotes_public_price_nonnegative"),
        sa.CheckConstraint("total_paid >= 0", name="ck_quotes_total_paid_nonnegative"),
        sa.ForeignKeyConstraint(["branch_id"], ["branches.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["client_id"], ["clients.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["seller_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_quotes_branch_id", "quotes", ["branch_id"])
    op.create_index("ix_quotes_client_id", "quotes", ["client_id"])
    op.create_index("ix_quotes_departure_date", "quotes", ["departure_date"])
    op.create_index("ix_quotes_folio", "quotes", ["folio"], unique=True)
    op.create_index("ix_quotes_seller_id", "quotes", ["seller_id"])
    op.create_index("ix_quotes_status", "quotes", ["status"])

    child_tables = (
        ("passengers", [
            sa.Column("name", sa.String(200), nullable=False),
            sa.Column("age", sa.Integer(), nullable=False),
            sa.Column("passenger_type", passenger_type, nullable=False),
            sa.CheckConstraint("age >= 0", name="ck_passengers_age_nonnegative"),
        ]),
        ("hotel_services", [
            sa.Column("purchase_method", sa.String(80), nullable=False),
            sa.Column("hotel_name", sa.String(200), nullable=False),
            sa.Column("check_in", sa.Date(), nullable=False),
            sa.Column("check_out", sa.Date(), nullable=False),
            sa.Column("plan", sa.String(100), nullable=False),
            sa.Column("rooms", sa.Integer(), nullable=False),
            sa.Column("operator", sa.String(150)), sa.Column("reservation_code", sa.String(100)),
            sa.Column("cancellation_date", sa.Date()), sa.Column("comments", sa.Text()),
            sa.Column("net_price", sa.Numeric(12, 2), nullable=False),
            sa.Column("public_price", sa.Numeric(12, 2), nullable=False),
            sa.CheckConstraint("rooms >= 1", name="ck_hotel_services_rooms_positive"),
            sa.CheckConstraint("net_price >= 0", name="ck_hotel_services_net_price_nonnegative"),
            sa.CheckConstraint("public_price >= 0", name="ck_hotel_services_public_price_nonnegative"),
        ]),
        ("flight_services", [
            sa.Column("purchase_method", sa.String(80), nullable=False),
            sa.Column("trip_type", flight_trip_type, nullable=False),
            sa.Column("origin", sa.String(200), nullable=False), sa.Column("destination", sa.String(200), nullable=False),
            sa.Column("departure_datetime", sa.DateTime(timezone=True), nullable=False),
            sa.Column("return_datetime", sa.DateTime(timezone=True)),
            sa.Column("airline", sa.String(150), nullable=False),
            sa.Column("outbound_flight_number", sa.String(50), nullable=False),
            sa.Column("return_flight_number", sa.String(50)), sa.Column("operator", sa.String(150)),
            sa.Column("operator_code", sa.String(100)), sa.Column("comments", sa.Text()),
            sa.Column("net_price", sa.Numeric(12, 2), nullable=False), sa.Column("public_price", sa.Numeric(12, 2), nullable=False),
            sa.CheckConstraint("net_price >= 0", name="ck_flight_services_net_price_nonnegative"),
            sa.CheckConstraint("public_price >= 0", name="ck_flight_services_public_price_nonnegative"),
        ]),
        ("tour_services", [
            sa.Column("purchase_method", sa.String(80), nullable=False), sa.Column("name", sa.String(200), nullable=False),
            sa.Column("start_datetime", sa.DateTime(timezone=True), nullable=False),
            sa.Column("cancellation_date", sa.DateTime(timezone=True)), sa.Column("operator", sa.String(150)),
            sa.Column("operator_code", sa.String(100)), sa.Column("comments", sa.Text()),
            sa.Column("net_price", sa.Numeric(12, 2), nullable=False), sa.Column("public_price", sa.Numeric(12, 2), nullable=False),
            sa.CheckConstraint("net_price >= 0", name="ck_tour_services_net_price_nonnegative"),
            sa.CheckConstraint("public_price >= 0", name="ck_tour_services_public_price_nonnegative"),
        ]),
        ("transport_services", [
            sa.Column("purchase_method", sa.String(80), nullable=False), sa.Column("transport_type", sa.String(80), nullable=False),
            sa.Column("trip_type", transport_trip_type, nullable=False),
            sa.Column("origin", sa.String(200), nullable=False), sa.Column("destination", sa.String(200), nullable=False),
            sa.Column("departure_datetime", sa.DateTime(timezone=True), nullable=False),
            sa.Column("return_datetime", sa.DateTime(timezone=True)), sa.Column("operator", sa.String(150)),
            sa.Column("operator_code", sa.String(100)), sa.Column("cancellation_date", sa.DateTime(timezone=True)),
            sa.Column("comments", sa.Text()), sa.Column("net_price", sa.Numeric(12, 2), nullable=False),
            sa.Column("public_price", sa.Numeric(12, 2), nullable=False),
            sa.CheckConstraint("net_price >= 0", name="ck_transport_services_net_price_nonnegative"),
            sa.CheckConstraint("public_price >= 0", name="ck_transport_services_public_price_nonnegative"),
        ]),
    )
    for table_name, columns in child_tables:
        op.create_table(
            table_name,
            sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("quote_id", postgresql.UUID(as_uuid=True), nullable=False),
            *columns,
            *timestamps(),
            sa.ForeignKeyConstraint(["quote_id"], ["quotes.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(f"ix_{table_name}_quote_id", table_name, ["quote_id"])

    op.create_table(
        "payments",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("quote_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True)),
        sa.Column("date", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("payment_type", payment_type, nullable=False),
        sa.Column("currency", sa.String(3), server_default=sa.text("'MXN'"), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("status", payment_status, nullable=False), sa.Column("comment", sa.Text()),
        *timestamps(),
        sa.CheckConstraint("amount >= 0", name="ck_payments_amount_nonnegative"),
        sa.ForeignKeyConstraint(["quote_id"], ["quotes.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_payments_quote_id", "payments", ["quote_id"])
    op.create_index("ix_payments_user_id", "payments", ["user_id"])
    op.create_table(
        "payment_schedules",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("quote_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("installment_number", sa.Integer(), nullable=False), sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False), sa.Column("status", schedule_status, nullable=False),
        *timestamps(),
        sa.CheckConstraint("amount >= 0", name="ck_payment_schedules_amount_nonnegative"),
        sa.CheckConstraint("installment_number >= 1", name="ck_payment_schedules_installment_positive"),
        sa.ForeignKeyConstraint(["quote_id"], ["quotes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("quote_id", "installment_number", name="uq_payment_schedules_quote_installment"),
    )
    op.create_index("ix_payment_schedules_quote_id", "payment_schedules", ["quote_id"])


def downgrade() -> None:
    for table_name in (
        "payment_schedules", "payments", "transport_services", "tour_services",
        "flight_services", "hotel_services", "passengers", "quotes", "users", "clients", "branches",
    ):
        op.drop_table(table_name)

    bind = op.get_bind()
    for enum_name in (
        "payment_schedule_status", "payment_status", "payment_type", "transport_trip_type",
        "flight_trip_type", "passenger_type", "quote_status", "client_status",
    ):
        postgresql.ENUM(name=enum_name).drop(bind, checkfirst=True)
