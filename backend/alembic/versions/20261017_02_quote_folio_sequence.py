"""Add concurrency-safe quote folio sequence.

Revision ID: 20261017_02
Revises: 20261016_01
Create Date: 2026-10-17
"""

from collections.abc import Sequence

from alembic import op


revision: str = "20261017_02"
down_revision: str | None = "20261016_01"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("CREATE SEQUENCE quote_folio_seq START WITH 1 INCREMENT BY 1")


def downgrade() -> None:
    op.execute("DROP SEQUENCE IF EXISTS quote_folio_seq")
