from decimal import Decimal
from types import SimpleNamespace

from app.services.quote_totals_service import recalculate_quote_totals


class Result:
    def __init__(self, values: tuple[Decimal, Decimal]) -> None:
        self.values = values

    def one(self) -> tuple[Decimal, Decimal]:
        return self.values


class FakeSession:
    def __init__(self, totals: list[tuple[Decimal, Decimal]], paid: Decimal = Decimal("0")) -> None:
        self.totals = iter(totals)
        self.paid = paid
        self.flushed = False

    def execute(self, statement):
        return Result(next(self.totals))

    def flush(self) -> None:
        self.flushed = True

    def scalar(self, statement) -> Decimal:
        return self.paid


def test_recalculate_quote_totals_sums_every_service_type() -> None:
    db = FakeSession([
        (Decimal("100.00"), Decimal("130.00")),
        (Decimal("20.00"), Decimal("40.00")),
        (Decimal("30.00"), Decimal("50.00")),
        (Decimal("200.00"), Decimal("280.00")),
    ], paid=Decimal("100.00"))
    quote = SimpleNamespace(id="quote", total_paid=Decimal("100.00"))
    recalculate_quote_totals(db, quote)
    assert quote.net_price == Decimal("350.00")
    assert quote.public_price == Decimal("500.00")
    assert quote.total_paid == Decimal("100.00")
    assert quote.remaining_balance == Decimal("400.00")
    assert db.flushed


def test_remaining_balance_never_becomes_negative() -> None:
    db = FakeSession([(Decimal("0"), Decimal("0"))] * 4)
    quote = SimpleNamespace(id="quote", total_paid=Decimal("100.00"))
    recalculate_quote_totals(db, quote)
    assert quote.remaining_balance == Decimal("0.00")
