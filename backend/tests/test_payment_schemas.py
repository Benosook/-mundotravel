from datetime import date, datetime, timezone
from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.models.payment import PaymentStatus
from app.schemas.payment import PaymentCreate
from app.schemas.payment_schedule import PaymentScheduleCreate
from app.services import BusinessRuleError
from app.services.payment_service import _validate_confirmed_amount


def payment(**changes) -> PaymentCreate:
    values = {
        "date": datetime.now(timezone.utc),
        "payment_type": "transfer",
        "amount": "2000.00",
    }
    values.update(changes)
    return PaymentCreate.model_validate(values)


def test_payment_requires_positive_amount_and_mxn() -> None:
    assert payment().currency == "MXN"
    for changes in ({"amount": "0"}, {"amount": "-1"}, {"currency": "USD"}):
        with pytest.raises(ValidationError):
            payment(**changes)


def test_confirmed_payment_cannot_exceed_available_balance() -> None:
    with pytest.raises(BusinessRuleError):
        _validate_confirmed_amount(Decimal("10000"), Decimal("9000"), payment(amount="1001"))
    with pytest.raises(BusinessRuleError):
        _validate_confirmed_amount(Decimal("10000"), Decimal("10000"), payment(amount="1"))


def test_pending_and_cancelled_do_not_use_available_balance() -> None:
    _validate_confirmed_amount(
        Decimal("0"), Decimal("0"), payment(amount="9999", status=PaymentStatus.PENDING)
    )
    _validate_confirmed_amount(
        Decimal("0"), Decimal("0"), payment(amount="9999", status=PaymentStatus.CANCELLED)
    )


def test_payment_schedule_validations() -> None:
    valid = PaymentScheduleCreate(
        installment_number=1, due_date=date(2027, 1, 1), amount=Decimal("0")
    )
    assert valid.status.value == "pending"
    for values in (
        {"installment_number": 0, "due_date": date(2027, 1, 1), "amount": 1},
        {"installment_number": 1, "due_date": date(2027, 1, 1), "amount": -1},
    ):
        with pytest.raises(ValidationError):
            PaymentScheduleCreate.model_validate(values)
