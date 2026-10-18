import uuid
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.core.security import create_access_token, hash_password
from app.database.session import get_db
from app.main import app


class FakeScalars:
    def all(self) -> list[object]:
        return []


class FakeDb:
    def __init__(self, user: object | None) -> None:
        self.user = user

    def scalar(self, _statement: object) -> object | None:
        return self.user

    def get(self, _model: object, _identifier: object) -> object | None:
        return self.user

    def scalars(self, _statement: object) -> FakeScalars:
        return FakeScalars()


def make_user() -> SimpleNamespace:
    return SimpleNamespace(
        id=uuid.uuid4(),
        email="ariadna@mundotravel.local",
        name="Ariadna",
        password_hash=hash_password("Secret123!"),
        active=True,
        role="agent",
        branch_id=uuid.uuid4(),
    )


def client_for(user: object | None) -> TestClient:
    def override_db():
        yield FakeDb(user)

    app.dependency_overrides[get_db] = override_db
    return TestClient(app)


def teardown_function() -> None:
    app.dependency_overrides.clear()


def test_login_success_and_me() -> None:
    user = make_user()
    client = client_for(user)
    login = client.post("/api/v1/auth/login", json={"email": user.email, "password": "Secret123!"})
    assert login.status_code == 200
    token = login.json()["access_token"]
    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["id"] == str(user.id)


def test_login_rejects_wrong_password_and_unknown_email() -> None:
    user = make_user()
    client = client_for(user)
    assert client.post("/api/v1/auth/login", json={"email": user.email, "password": "wrong"}).status_code == 401
    client = client_for(None)
    assert client.post("/api/v1/auth/login", json={"email": "unknown@example.com", "password": "Secret123!"}).status_code == 401


def test_me_and_business_routes_require_authentication() -> None:
    client = client_for(make_user())
    assert client.get("/api/v1/auth/me").status_code == 401
    assert client.get("/api/v1/clients").status_code == 401


def test_business_route_accepts_valid_token() -> None:
    user = make_user()
    client = client_for(user)
    token = create_access_token(str(user.id))
    response = client.get("/api/v1/clients", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json() == []
