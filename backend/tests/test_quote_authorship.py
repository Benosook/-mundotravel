import uuid
from datetime import date, datetime, timezone
from unittest.mock import Mock

from app.schemas.quote import QuoteCreate
from app.services.quote_service import create_quote


def test_create_quote_assigns_authenticated_seller() -> None:
    db = Mock()
    db.get.return_value = object()
    db.execute.return_value.scalar_one.return_value = "MT-2026-000001"
    captured: dict[str, object] = {}
    db.add.side_effect = lambda quote: captured.update(quote=quote)
    db.scalar.side_effect = lambda _statement: captured["quote"]
    seller_id = uuid.uuid4()
    payload = QuoteCreate(
        client_id=uuid.uuid4(),
        branch_id=uuid.uuid4(),
        sale_date=datetime.now(timezone.utc),
        departure_date=date(2027, 1, 10),
        return_date=date(2027, 1, 15),
    )

    quote = create_quote(db, payload, seller_id)

    assert quote.seller_id == seller_id
    db.commit.assert_called_once_with()
