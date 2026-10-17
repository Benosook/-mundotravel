from datetime import date, datetime, timedelta, timezone

import pytest
from pydantic import ValidationError

from app.schemas.flight_service import FlightServiceCreate
from app.schemas.hotel_service import HotelServiceCreate
from app.schemas.tour_service import TourServiceCreate
from app.schemas.transport_service import TransportServiceCreate


NOW = datetime(2027, 1, 10, 12, tzinfo=timezone.utc)


def test_hotel_validations() -> None:
    valid = {
        "purchase_method": "Gestión interna", "hotel_name": "Hotel Centro",
        "check_in": date(2027, 1, 10), "check_out": date(2027, 1, 12),
        "plan": "Todo incluido", "rooms": 1, "net_price": "100.00", "public_price": "120.00",
    }
    assert HotelServiceCreate.model_validate(valid).rooms == 1
    for changes in (
        {"check_out": date(2027, 1, 9)}, {"rooms": 0}, {"net_price": "-1"},
    ):
        with pytest.raises(ValidationError):
            HotelServiceCreate.model_validate({**valid, **changes})


def test_tour_cancellation_must_precede_start() -> None:
    valid = {
        "purchase_method": "Operadora", "name": "Tour", "start_datetime": NOW,
        "net_price": "50.00", "public_price": "75.00",
    }
    assert TourServiceCreate.model_validate(valid).name == "Tour"
    with pytest.raises(ValidationError):
        TourServiceCreate.model_validate({**valid, "cancellation_date": NOW + timedelta(hours=1)})


def test_transport_round_and_one_way_rules() -> None:
    base = {
        "purchase_method": "Interna", "transport_type": "Privado", "origin": "MTY",
        "destination": "CUN", "departure_datetime": NOW, "net_price": "10", "public_price": "15",
    }
    with pytest.raises(ValidationError):
        TransportServiceCreate.model_validate({**base, "trip_type": "round"})
    assert TransportServiceCreate.model_validate(
        {**base, "trip_type": "round", "return_datetime": NOW + timedelta(days=1)}
    ).trip_type.value == "round"
    assert TransportServiceCreate.model_validate({**base, "trip_type": "one-way"}).return_datetime is None
    with pytest.raises(ValidationError):
        TransportServiceCreate.model_validate(
            {**base, "trip_type": "one-way", "return_datetime": NOW + timedelta(days=1)}
        )


def test_flight_round_and_one_way_rules() -> None:
    base = {
        "purchase_method": "Interna", "origin": "MTY", "destination": "CUN",
        "departure_datetime": NOW, "airline": "Demo", "outbound_flight_number": "DM100",
        "net_price": "100", "public_price": "150",
    }
    with pytest.raises(ValidationError):
        FlightServiceCreate.model_validate({**base, "trip_type": "round"})
    with pytest.raises(ValidationError):
        FlightServiceCreate.model_validate(
            {**base, "trip_type": "round", "return_datetime": NOW + timedelta(days=1)}
        )
    assert FlightServiceCreate.model_validate(
        {
            **base, "trip_type": "round", "return_datetime": NOW + timedelta(days=1),
            "return_flight_number": "DM101",
        }
    ).return_flight_number == "DM101"
    assert FlightServiceCreate.model_validate({**base, "trip_type": "one-way"}).return_datetime is None
