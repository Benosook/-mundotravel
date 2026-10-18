import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentRead, PaymentUpdate
from app.services import BusinessRuleError, ConflictError, ResourceNotFoundError
from app.services.payment_service import create_payment, get_payment, list_payments, update_payment


router = APIRouter(prefix="/quotes/{quote_id}/payments", tags=["Payments"])
DbSession = Annotated[Session, Depends(get_db)]


def _get(quote_id: uuid.UUID, payment_id: uuid.UUID, db: Session):
    try:
        payment = get_payment(db, quote_id, payment_id)
    except ResourceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    if payment is None:
        raise HTTPException(status_code=404, detail="Abono no encontrado.")
    return payment


@router.post("", response_model=PaymentRead, status_code=201)
def create(payload: PaymentCreate, quote_id: uuid.UUID, db: DbSession, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        payment = create_payment(db, quote_id, payload, current_user.id)
        result = PaymentRead.model_validate(payment)
        return result.model_copy(update={"user_name": current_user.name})
    except ResourceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except BusinessRuleError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.get("", response_model=list[PaymentRead])
def list_all(quote_id: uuid.UUID, db: DbSession):
    try:
        return [PaymentRead.model_validate(payment).model_copy(update={"user_name": payment.user.name if payment.user else None}) for payment in list_payments(db, quote_id)]
    except ResourceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{payment_id}", response_model=PaymentRead)
def get_one(quote_id: uuid.UUID, payment_id: uuid.UUID, db: DbSession):
    payment = _get(quote_id, payment_id, db)
    return PaymentRead.model_validate(payment).model_copy(update={"user_name": payment.user.name if payment.user else None})


@router.patch("/{payment_id}", response_model=PaymentRead)
def update(payload: PaymentUpdate, quote_id: uuid.UUID, payment_id: uuid.UUID, db: DbSession):
    try:
        return update_payment(db, _get(quote_id, payment_id, db), payload)
    except BusinessRuleError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
