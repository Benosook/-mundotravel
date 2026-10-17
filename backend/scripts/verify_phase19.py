import uuid
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy import func, select

from app.database.session import SessionLocal
from app.main import app
from app.models.payment import Payment, PaymentStatus
from app.models.payment_schedule import PaymentSchedule
from app.models.quote import Quote


def amount(value) -> Decimal:
    return Decimal(str(value))


def financials(api: TestClient, quote_id: str) -> tuple[Decimal, Decimal, Decimal]:
    response = api.get(f"/api/v1/quotes/{quote_id}")
    assert response.status_code == 200, response.text
    data = response.json()
    return amount(data["public_price"]), amount(data["total_paid"]), amount(data["remaining_balance"])


def add_payment(api: TestClient, quote_id: str, payment_amount: str, status: str = "confirmed") -> str:
    response = api.post(
        f"/api/v1/quotes/{quote_id}/payments",
        json={
            "date": "2026-10-17T12:00:00-06:00",
            "payment_type": "transfer",
            "amount": payment_amount,
            "status": status,
            "comment": f"Verificación Fase 19 - {status}",
        },
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


def verify() -> None:
    api = TestClient(app)
    with SessionLocal() as db:
        quotes = list(db.scalars(select(Quote).order_by(Quote.created_at.desc())).all())
        quote = next((item for item in quotes if not item.payments), None)
        assert quote is not None
        quote_id = str(quote.id)
        other_quote_id = str(next(item.id for item in quotes if item.id != quote.id))

    hotel = api.post(
        f"/api/v1/quotes/{quote_id}/hotels",
        json={
            "purchase_method": "Interna", "hotel_name": "Hotel Financiero", "check_in": "2027-02-01",
            "check_out": "2027-02-05", "plan": "Desayuno", "rooms": 1,
            "net_price": "4000.00", "public_price": "5000.00",
        },
    )
    assert hotel.status_code == 201, hotel.text
    hotel_id = hotel.json()["id"]
    flight = api.post(
        f"/api/v1/quotes/{quote_id}/flights",
        json={
            "purchase_method": "Interna", "trip_type": "one-way", "origin": "MTY", "destination": "CUN",
            "departure_datetime": "2027-02-01T08:00:00-06:00", "airline": "Demo",
            "outbound_flight_number": "DM200", "net_price": "4000.00", "public_price": "5000.00",
        },
    )
    assert flight.status_code == 201, flight.text
    flight_id = flight.json()["id"]
    assert financials(api, quote_id) == (Decimal("10000.00"), Decimal("0.00"), Decimal("10000.00"))

    first = add_payment(api, quote_id, "2000.00")
    assert financials(api, quote_id) == (Decimal("10000.00"), Decimal("2000.00"), Decimal("8000.00"))
    second = add_payment(api, quote_id, "3000.00")
    assert financials(api, quote_id) == (Decimal("10000.00"), Decimal("5000.00"), Decimal("5000.00"))
    pending = add_payment(api, quote_id, "1000.00", "pending")
    cancelled = add_payment(api, quote_id, "1000.00", "cancelled")
    assert financials(api, quote_id)[1:] == (Decimal("5000.00"), Decimal("5000.00"))
    assert api.post(
        f"/api/v1/quotes/{quote_id}/payments",
        json={"date": "2026-10-17T12:00:00-06:00", "payment_type": "cash", "amount": "5000.01"},
    ).status_code == 400

    assert api.patch(f"/api/v1/quotes/{quote_id}/payments/{first}", json={"status": "cancelled"}).status_code == 200
    assert financials(api, quote_id)[1:] == (Decimal("3000.00"), Decimal("7000.00"))
    assert api.patch(f"/api/v1/quotes/{quote_id}/payments/{pending}", json={"status": "confirmed"}).status_code == 200
    assert financials(api, quote_id)[1:] == (Decimal("4000.00"), Decimal("6000.00"))
    assert api.patch(f"/api/v1/quotes/{quote_id}/payments/{second}", json={"amount": "3500.00"}).status_code == 200
    assert financials(api, quote_id)[1:] == (Decimal("4500.00"), Decimal("5500.00"))
    liquidation = add_payment(api, quote_id, "5500.00")
    assert financials(api, quote_id)[1:] == (Decimal("10000.00"), Decimal("0.00"))
    assert api.post(
        f"/api/v1/quotes/{quote_id}/payments",
        json={"date": "2026-10-17T12:00:00-06:00", "payment_type": "cash", "amount": "1.00"},
    ).status_code == 400

    payments = api.get(f"/api/v1/quotes/{quote_id}/payments")
    assert payments.status_code == 200 and len(payments.json()) == 5
    assert api.get(f"/api/v1/quotes/{quote_id}/payments/{second}").status_code == 200
    assert api.get(f"/api/v1/quotes/{other_quote_id}/payments/{second}").status_code == 404
    assert api.get(f"/api/v1/quotes/{uuid.uuid4()}/payments").status_code == 404

    schedule_payload = {"installment_number": 1, "due_date": "2026-11-01", "amount": "2500.00"}
    schedule = api.post(f"/api/v1/quotes/{quote_id}/payment-schedule", json=schedule_payload)
    assert schedule.status_code == 201, schedule.text
    schedule_id = schedule.json()["id"]
    assert api.post(f"/api/v1/quotes/{quote_id}/payment-schedule", json=schedule_payload).status_code == 409
    assert len(api.get(f"/api/v1/quotes/{quote_id}/payment-schedule").json()) == 1
    assert api.get(f"/api/v1/quotes/{quote_id}/payment-schedule/{schedule_id}").status_code == 200
    patched_schedule = api.patch(
        f"/api/v1/quotes/{quote_id}/payment-schedule/{schedule_id}", json={"status": "paid"}
    )
    assert patched_schedule.status_code == 200 and patched_schedule.json()["status"] == "paid"
    detail = api.get(f"/api/v1/quotes/{quote_id}").json()
    assert len(detail["payments"]) == 5 and len(detail["payment_schedule"]) == 1

    flight_patch = api.patch(
        f"/api/v1/quotes/{quote_id}/flights/{flight_id}", json={"public_price": "7000.00"}
    )
    assert flight_patch.status_code == 200, flight_patch.text
    assert financials(api, quote_id) == (Decimal("12000.00"), Decimal("10000.00"), Decimal("2000.00"))
    assert api.delete(f"/api/v1/quotes/{quote_id}/hotels/{hotel_id}").status_code == 204
    assert financials(api, quote_id) == (Decimal("7000.00"), Decimal("10000.00"), Decimal("0.00"))

    with SessionLocal() as db:
        confirmed_sum = db.scalar(
            select(func.sum(Payment.amount)).where(
                Payment.quote_id == uuid.UUID(quote_id), Payment.status == PaymentStatus.CONFIRMED
            )
        )
        stored_quote = db.get(Quote, uuid.UUID(quote_id))
        schedule_count = db.scalar(
            select(func.count()).select_from(PaymentSchedule).where(PaymentSchedule.quote_id == uuid.UUID(quote_id))
        )
        assert confirmed_sum == Decimal("10000.00")
        assert stored_quote and stored_quote.public_price == Decimal("7000.00")
        assert stored_quote.remaining_balance == Decimal("0.00")
        assert schedule_count == 1

    for payment_id in (second, pending, liquidation):
        assert api.patch(
            f"/api/v1/quotes/{quote_id}/payments/{payment_id}", json={"status": "cancelled"}
        ).status_code == 200
    assert api.delete(f"/api/v1/quotes/{quote_id}/payment-schedule/{schedule_id}").status_code == 204
    assert api.delete(f"/api/v1/quotes/{quote_id}/flights/{flight_id}").status_code == 204
    assert financials(api, quote_id) == (Decimal("0.00"), Decimal("0.00"), Decimal("0.00"))

    # Verification cleanup only: the public API never physically deletes payments.
    created_payment_ids = [first, second, pending, cancelled, liquidation]
    with SessionLocal() as db:
        for payment_id in created_payment_ids:
            payment = db.get(Payment, uuid.UUID(payment_id))
            assert payment is not None and str(payment.quote_id) == quote_id
            db.delete(payment)
        db.commit()
        remaining_test_payments = db.scalar(
            select(func.count()).select_from(Payment).where(Payment.id.in_([uuid.UUID(item) for item in created_payment_ids]))
        )
        assert remaining_test_payments == 0

    print(f"Cotización financiera verificada: {quote_id}")
    print("Sobrepago verificado: public=7000.00, paid=10000.00, remaining=0.00")
    print("5 payments verificados y retirados de forma controlada como datos de prueba")


if __name__ == "__main__":
    verify()
