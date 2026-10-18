import uuid
from datetime import date, datetime, timezone

import pytest
from pydantic import ValidationError

from app.schemas.client import ClientCreate
from app.schemas.quote import QuoteCreate


def quote_payload() -> dict[str, object]:
    return {
        "client_id": uuid.uuid4(),
        "branch_id": uuid.uuid4(),
        "sale_date": datetime.now(timezone.utc),
        "departure_date": date(2027, 1, 10),
        "return_date": date(2027, 1, 15),
    }


def test_client_create_strips_text_and_validates_email() -> None:
    client = ClientCreate(
        first_name="  Ariadna ",
        last_name="  Martínez ",
        phone=" 8112345678 ",
        email="ariadna@example.com",
    )
    assert client.first_name == "Ariadna"
    assert client.last_name == "Martínez"
    assert client.phone == "8112345678"

    with pytest.raises(ValidationError):
        ClientCreate(first_name="Ariadna", last_name="M", phone="1", email="correo-invalido")


def test_quote_create_rejects_invalid_date_range() -> None:
    payload = quote_payload()
    payload["return_date"] = date(2027, 1, 9)
    with pytest.raises(ValidationError):
        QuoteCreate.model_validate(payload)


def test_quote_create_does_not_accept_backend_totals() -> None:
    payload = quote_payload()
    payload["public_price"] = "999.99"
    with pytest.raises(ValidationError):
        QuoteCreate.model_validate(payload)


def test_quote_create_rejects_seller_impersonation() -> None:
    payload = quote_payload()
    payload["seller_id"] = uuid.uuid4()
    with pytest.raises(ValidationError):
        QuoteCreate.model_validate(payload)
