import uuid
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy import func, select

from app.database.session import SessionLocal
from app.main import app
from app.models.flight_service import FlightService
from app.models.hotel_service import HotelService
from app.models.quote import Quote
from app.models.tour_service import TourService
from app.models.transport_service import TransportService


def money(value: str | int | float) -> Decimal:
    return Decimal(str(value))


def quote_totals(api: TestClient, quote_id: str) -> tuple[Decimal, Decimal, Decimal]:
    response = api.get(f"/api/v1/quotes/{quote_id}")
    assert response.status_code == 200, response.text
    data = response.json()
    return money(data["net_price"]), money(data["public_price"]), money(data["remaining_balance"])


def verify() -> None:
    api = TestClient(app)
    with SessionLocal() as db:
        quotes = list(db.scalars(select(Quote).order_by(Quote.created_at)).all())
        assert len(quotes) >= 2, "Ejecuta primero scripts.seed_dev y la verificación de Fase 17."
        quote_id, other_quote_id = str(quotes[0].id), str(quotes[1].id)

    assert quote_totals(api, quote_id) == (Decimal("0.00"),) * 3
    missing_quote = str(uuid.uuid4())

    hotel_payload = {
        "purchase_method": "Gestión interna", "hotel_name": "Hotel Fase 18",
        "check_in": "2027-01-10", "check_out": "2027-01-15", "plan": "Todo incluido",
        "rooms": 1, "operator": "+MundoTravel", "net_price": "1000.00", "public_price": "1200.00",
    }
    assert api.post(f"/api/v1/quotes/{missing_quote}/hotels", json=hotel_payload).status_code == 404
    assert api.post(f"/api/v1/quotes/{quote_id}/hotels", json={**hotel_payload, "rooms": 0}).status_code == 422
    hotel_response = api.post(f"/api/v1/quotes/{quote_id}/hotels", json=hotel_payload)
    assert hotel_response.status_code == 201, hotel_response.text
    hotel_id = hotel_response.json()["id"]
    assert quote_totals(api, quote_id) == (Decimal("1000.00"), Decimal("1200.00"), Decimal("1200.00"))
    assert api.get(f"/api/v1/quotes/{quote_id}/hotels/{hotel_id}").status_code == 200
    assert len(api.get(f"/api/v1/quotes/{quote_id}/hotels").json()) == 1
    assert api.get(f"/api/v1/quotes/{other_quote_id}/hotels/{hotel_id}").status_code == 404

    tour_payload = {
        "purchase_method": "Operadora", "name": "Tour Fase 18",
        "start_datetime": "2027-01-12T10:00:00-06:00", "cancellation_date": "2027-01-10T10:00:00-06:00",
        "net_price": "200.00", "public_price": "300.00",
    }
    tour_response = api.post(f"/api/v1/quotes/{quote_id}/tours", json=tour_payload)
    assert tour_response.status_code == 201, tour_response.text
    tour_id = tour_response.json()["id"]
    assert quote_totals(api, quote_id) == (Decimal("1200.00"), Decimal("1500.00"), Decimal("1500.00"))

    transport_payload = {
        "purchase_method": "Gestión interna", "transport_type": "Privado", "trip_type": "round",
        "origin": "Aeropuerto", "destination": "Hotel", "departure_datetime": "2027-01-10T12:00:00-06:00",
        "return_datetime": "2027-01-15T12:00:00-06:00", "net_price": "300.00", "public_price": "400.00",
    }
    transport_response = api.post(f"/api/v1/quotes/{quote_id}/transports", json=transport_payload)
    assert transport_response.status_code == 201, transport_response.text
    transport_id = transport_response.json()["id"]
    assert quote_totals(api, quote_id) == (Decimal("1500.00"), Decimal("1900.00"), Decimal("1900.00"))

    flight_payload = {
        "purchase_method": "Gestión interna", "trip_type": "round", "origin": "MTY", "destination": "CUN",
        "departure_datetime": "2027-01-10T08:00:00-06:00", "return_datetime": "2027-01-15T18:00:00-06:00",
        "airline": "Aerolínea Demo", "outbound_flight_number": "DM100", "return_flight_number": "DM101",
        "net_price": "2000.00", "public_price": "2500.00",
    }
    flight_response = api.post(f"/api/v1/quotes/{quote_id}/flights", json=flight_payload)
    assert flight_response.status_code == 201, flight_response.text
    flight_id = flight_response.json()["id"]
    assert quote_totals(api, quote_id) == (Decimal("3500.00"), Decimal("4400.00"), Decimal("4400.00"))

    detail = api.get(f"/api/v1/quotes/{quote_id}").json()
    assert all(len(detail[key]) == 1 for key in ("hotels", "tours", "transports", "flights"))

    patch_hotel = api.patch(
        f"/api/v1/quotes/{quote_id}/hotels/{hotel_id}",
        json={"net_price": "1100.00", "public_price": "1400.00"},
    )
    assert patch_hotel.status_code == 200, patch_hotel.text
    assert quote_totals(api, quote_id) == (Decimal("3600.00"), Decimal("4600.00"), Decimal("4600.00"))

    assert api.delete(f"/api/v1/quotes/{quote_id}/tours/{tour_id}").status_code == 204
    assert quote_totals(api, quote_id) == (Decimal("3400.00"), Decimal("4300.00"), Decimal("4300.00"))

    with SessionLocal() as db:
        counts_before_cleanup = {
            "hotels": db.scalar(select(func.count()).select_from(HotelService)),
            "tours": db.scalar(select(func.count()).select_from(TourService)),
            "transports": db.scalar(select(func.count()).select_from(TransportService)),
            "flights": db.scalar(select(func.count()).select_from(FlightService)),
        }
        stored_quote = db.get(Quote, uuid.UUID(quote_id))
        assert stored_quote and stored_quote.net_price == Decimal("3400.00")
        assert stored_quote.public_price == Decimal("4300.00")

    assert api.delete(f"/api/v1/quotes/{quote_id}/hotels/{hotel_id}").status_code == 204
    assert api.delete(f"/api/v1/quotes/{quote_id}/transports/{transport_id}").status_code == 204
    assert api.delete(f"/api/v1/quotes/{quote_id}/flights/{flight_id}").status_code == 204
    assert quote_totals(api, quote_id) == (Decimal("0.00"),) * 3

    print(f"Cotización verificada: {quote_id}")
    print(f"Registros antes de limpieza: {counts_before_cleanup}")
    print("Totales finales: net=0.00 public=0.00 remaining=0.00")


if __name__ == "__main__":
    verify()
