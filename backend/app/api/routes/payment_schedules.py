import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.payment_schedule import PaymentScheduleCreate, PaymentScheduleRead, PaymentScheduleUpdate
from app.services import BusinessRuleError, ConflictError, ResourceNotFoundError
from app.services.payment_schedule_service import (
    create_payment_schedule, delete_payment_schedule, get_payment_schedule,
    list_payment_schedules, update_payment_schedule,
)


router = APIRouter(prefix="/quotes/{quote_id}/payment-schedule", tags=["Payment Schedule"])
DbSession = Annotated[Session, Depends(get_db)]


def _get(quote_id: uuid.UUID, schedule_id: uuid.UUID, db: Session):
    try:
        schedule = get_payment_schedule(db, quote_id, schedule_id)
    except ResourceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    if schedule is None:
        raise HTTPException(status_code=404, detail="Anticipo programado no encontrado.")
    return schedule


@router.post("", response_model=PaymentScheduleRead, status_code=201)
def create(payload: PaymentScheduleCreate, quote_id: uuid.UUID, db: DbSession):
    try:
        return create_payment_schedule(db, quote_id, payload)
    except ResourceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.get("", response_model=list[PaymentScheduleRead])
def list_all(quote_id: uuid.UUID, db: DbSession):
    try:
        return list_payment_schedules(db, quote_id)
    except ResourceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{schedule_id}", response_model=PaymentScheduleRead)
def get_one(quote_id: uuid.UUID, schedule_id: uuid.UUID, db: DbSession):
    return _get(quote_id, schedule_id, db)


@router.patch("/{schedule_id}", response_model=PaymentScheduleRead)
def update(payload: PaymentScheduleUpdate, quote_id: uuid.UUID, schedule_id: uuid.UUID, db: DbSession):
    try:
        return update_payment_schedule(db, _get(quote_id, schedule_id, db), payload)
    except BusinessRuleError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.delete("/{schedule_id}", status_code=204)
def delete(quote_id: uuid.UUID, schedule_id: uuid.UUID, db: DbSession) -> Response:
    try:
        delete_payment_schedule(db, _get(quote_id, schedule_id, db))
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return Response(status_code=204)
