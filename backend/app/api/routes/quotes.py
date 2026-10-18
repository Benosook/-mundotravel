import uuid
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.dependencies import get_current_user
from app.models.quote import Quote, QuoteStatus
from app.models.user import User
from app.schemas.quote import QuoteCreate, QuoteListItem, QuoteRead, QuoteUpdate
from app.services import BusinessRuleError, ConflictError, ResourceNotFoundError
from app.services.quote_service import create_quote, delete_quote, get_quote, list_quotes, update_quote


router = APIRouter(prefix="/quotes", tags=["Quotes"])
DbSession = Annotated[Session, Depends(get_db)]


def _list_item(quote: Quote) -> QuoteListItem:
    return QuoteListItem(
        id=quote.id,
        folio=quote.folio,
        client_id=quote.client_id,
        client_name=quote.client.full_name,
        seller_id=quote.seller_id,
        seller_name=quote.seller.name if quote.seller else None,
        branch_id=quote.branch_id,
        branch_name=quote.branch.name,
        status=quote.status,
        sale_date=quote.sale_date,
        departure_date=quote.departure_date,
        return_date=quote.return_date,
        currency=quote.currency,
        public_price=quote.public_price,
        net_price=quote.net_price,
        total_paid=quote.total_paid,
        remaining_balance=quote.remaining_balance,
        created_at=quote.created_at,
    )


def _business_error(exc: Exception) -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("", response_model=QuoteRead, status_code=status.HTTP_201_CREATED)
def create_quote_endpoint(
    payload: QuoteCreate,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> QuoteRead:
    try:
        return QuoteRead.model_validate(create_quote(db, payload, current_user.id))
    except (ResourceNotFoundError, BusinessRuleError) as exc:
        raise _business_error(exc) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.get("", response_model=list[QuoteListItem])
def list_quotes_endpoint(
    db: DbSession,
    search: str | None = None,
    quote_status: Annotated[QuoteStatus | None, Query(alias="status")] = None,
    client_id: uuid.UUID | None = None,
    seller_id: uuid.UUID | None = None,
    branch_id: uuid.UUID | None = None,
    departure_from: date | None = None,
    departure_to: date | None = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[QuoteListItem]:
    if departure_from and departure_to and departure_to < departure_from:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="departure_to no puede ser anterior a departure_from.",
        )
    quotes = list_quotes(
        db,
        search=search,
        status=quote_status,
        client_id=client_id,
        seller_id=seller_id,
        branch_id=branch_id,
        departure_from=departure_from,
        departure_to=departure_to,
        limit=limit,
        offset=offset,
    )
    return [_list_item(quote) for quote in quotes]


@router.get("/{quote_id}", response_model=QuoteRead)
def get_quote_endpoint(quote_id: uuid.UUID, db: DbSession) -> QuoteRead:
    quote = get_quote(db, quote_id)
    if quote is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cotización no encontrada.")
    return QuoteRead.model_validate(quote)


@router.patch("/{quote_id}", response_model=QuoteRead)
def update_quote_endpoint(quote_id: uuid.UUID, payload: QuoteUpdate, db: DbSession) -> QuoteRead:
    quote = get_quote(db, quote_id)
    if quote is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cotización no encontrada.")
    try:
        return QuoteRead.model_validate(update_quote(db, quote, payload))
    except (ResourceNotFoundError, BusinessRuleError) as exc:
        raise _business_error(exc) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.delete("/{quote_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quote_endpoint(quote_id: uuid.UUID, db: DbSession) -> Response:
    quote = get_quote(db, quote_id)
    if quote is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cotización no encontrada.")
    try:
        delete_quote(db, quote)
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)
