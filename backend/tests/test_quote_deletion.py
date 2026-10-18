from types import SimpleNamespace
from unittest.mock import Mock

import pytest

from app.services import ConflictError
from app.services.quote_service import delete_quote


def test_delete_quote_without_payments_commits_deletion() -> None:
    db = Mock()
    quote = SimpleNamespace(payments=[])

    delete_quote(db, quote)

    db.delete.assert_called_once_with(quote)
    db.commit.assert_called_once_with()


def test_delete_quote_with_payments_preserves_financial_history() -> None:
    db = Mock()
    quote = SimpleNamespace(payments=[object()])

    with pytest.raises(ConflictError, match="pagos o abonos"):
        delete_quote(db, quote)

    db.delete.assert_not_called()
    db.commit.assert_not_called()
