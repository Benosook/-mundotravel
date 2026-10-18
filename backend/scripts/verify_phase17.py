import uuid
from datetime import date, datetime, timezone

from fastapi.testclient import TestClient
from sqlalchemy import func, select

from app.core.config import settings
from app.database.session import SessionLocal
from app.main import app
from app.models.branch import Branch
from app.models.client import Client
from app.models.quote import Quote
from app.models.user import User


def verify() -> None:
    api = TestClient(app)
    assert api.get("/api/v1/health").status_code == 200
    assert api.get("/docs").status_code == 200

    with SessionLocal() as db:
        branch = db.scalar(select(Branch).where(Branch.name == "+MundoTravel Principal"))
        seller = db.scalar(select(User).where(User.email == settings.DEV_USER_EMAIL))
        assert branch is not None and seller is not None
        branch_id, seller_id = str(branch.id), str(seller.id)

    suffix = uuid.uuid4().hex[:8]
    create_client_response = api.post(
        "/api/v1/clients",
        json={
            "first_name": "Cliente",
            "last_name": f"Verificación {suffix}",
            "phone": "8112345678",
            "email": f"fase17-{suffix}@example.com",
            "notes": "Registro de verificación de la Fase 17",
        },
    )
    assert create_client_response.status_code == 201, create_client_response.text
    client = create_client_response.json()
    client_id = client["id"]
    assert api.get(f"/api/v1/clients/{client_id}").status_code == 200
    assert api.get("/api/v1/clients", params={"search": suffix}).json()[0]["id"] == client_id
    assert api.patch(f"/api/v1/clients/{client_id}", json={"phone": "8187654321"}).status_code == 200
    assert api.get(f"/api/v1/clients/{uuid.uuid4()}").status_code == 404

    quote_payload = {
        "client_id": client_id,
        "seller_id": seller_id,
        "branch_id": branch_id,
        "sale_date": datetime.now(timezone.utc).isoformat(),
        "payment_limit_date": date(2027, 1, 5).isoformat(),
        "departure_date": date(2027, 1, 10).isoformat(),
        "return_date": date(2027, 1, 15).isoformat(),
        "internal_comment": "Cotización de verificación Fase 17",
    }
    missing_payload = {**quote_payload, "client_id": str(uuid.uuid4())}
    assert api.post("/api/v1/quotes", json=missing_payload).status_code == 400
    missing_seller = {**quote_payload, "seller_id": str(uuid.uuid4())}
    assert api.post("/api/v1/quotes", json=missing_seller).status_code == 400
    missing_branch = {**quote_payload, "branch_id": str(uuid.uuid4())}
    assert api.post("/api/v1/quotes", json=missing_branch).status_code == 400
    invalid_dates = {**quote_payload, "return_date": date(2027, 1, 1).isoformat()}
    assert api.post("/api/v1/quotes", json=invalid_dates).status_code == 422

    create_quote_response = api.post("/api/v1/quotes", json=quote_payload)
    assert create_quote_response.status_code == 201, create_quote_response.text
    quote = create_quote_response.json()
    quote_id, folio = quote["id"], quote["folio"]
    assert folio.startswith("MT-")
    assert quote["public_price"] == "0.00"
    assert api.get(f"/api/v1/quotes/{quote_id}").status_code == 200
    filtered = api.get("/api/v1/quotes", params={"search": suffix, "status": "pending"})
    assert filtered.status_code == 200 and filtered.json()[0]["id"] == quote_id
    by_relations = api.get(
        "/api/v1/quotes",
        params={"client_id": client_id, "seller_id": seller_id, "branch_id": branch_id},
    )
    assert by_relations.status_code == 200 and by_relations.json()[0]["id"] == quote_id
    updated = api.patch(
        f"/api/v1/quotes/{quote_id}", json={"internal_comment": "Cotización verificada"}
    )
    assert updated.status_code == 200 and updated.json()["internal_comment"] == "Cotización verificada"
    assert api.patch(
        f"/api/v1/quotes/{quote_id}",
        json={"departure_date": "2027-02-01", "return_date": "2027-01-15"},
    ).status_code == 400
    assert api.get(f"/api/v1/quotes/{uuid.uuid4()}").status_code == 404

    with SessionLocal() as db:
        persisted_client = db.get(Client, uuid.UUID(client_id))
        persisted_quote = db.get(Quote, uuid.UUID(quote_id))
        assert persisted_client is not None and persisted_client.phone == "8187654321"
        assert persisted_quote is not None and persisted_quote.folio == folio
        client_count = db.scalar(select(func.count()).select_from(Client))
        quote_count = db.scalar(select(func.count()).select_from(Quote))

    print(f"Cliente persistido: {client_id}")
    print(f"Cotización persistida: {quote_id} / {folio}")
    print(f"Registros PostgreSQL: clients={client_count}, quotes={quote_count}")


if __name__ == "__main__":
    verify()
