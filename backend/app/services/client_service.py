import uuid

from sqlalchemy import Select, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.client import Client, ClientStatus
from app.schemas.client import ClientCreate, ClientUpdate
from app.services import ConflictError


def create_client(db: Session, data: ClientCreate) -> Client:
    client = Client(**data.model_dump())
    db.add(client)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("No fue posible crear el cliente con esos datos.") from exc
    db.refresh(client)
    return client


def get_client(db: Session, client_id: uuid.UUID) -> Client | None:
    return db.get(Client, client_id)


def list_clients(
    db: Session,
    *,
    search: str | None = None,
    status: ClientStatus | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[Client]:
    statement: Select[tuple[Client]] = select(Client)
    if search and (term := search.strip()):
        pattern = f"%{term}%"
        statement = statement.where(
            or_(
                Client.first_name.ilike(pattern),
                Client.last_name.ilike(pattern),
                Client.phone.ilike(pattern),
                Client.email.ilike(pattern),
            )
        )
    if status is not None:
        statement = statement.where(Client.status == status)
    statement = statement.order_by(Client.created_at.desc()).limit(limit).offset(offset)
    return list(db.scalars(statement).all())


def update_client(db: Session, client: Client, data: ClientUpdate) -> Client:
    changes = data.model_dump(exclude_unset=True)
    for required_field in ("first_name", "last_name", "phone", "status"):
        if required_field in changes and changes[required_field] is None:
            raise ConflictError(f"{required_field} no puede ser nulo.")
    for field, value in changes.items():
        setattr(client, field, value)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("No fue posible actualizar el cliente con esos datos.") from exc
    db.refresh(client)
    return client
