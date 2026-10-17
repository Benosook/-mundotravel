from fastapi import APIRouter

from app.api.routes.health import router as health_router
from app.api.routes.clients import router as clients_router
from app.api.routes.quotes import router as quotes_router
from app.api.routes.hotel_services import router as hotel_services_router
from app.api.routes.tour_services import router as tour_services_router
from app.api.routes.transport_services import router as transport_services_router
from app.api.routes.flight_services import router as flight_services_router
from app.api.routes.payments import router as payments_router
from app.api.routes.payment_schedules import router as payment_schedules_router


api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(clients_router)
api_router.include_router(quotes_router)
api_router.include_router(hotel_services_router)
api_router.include_router(tour_services_router)
api_router.include_router(transport_services_router)
api_router.include_router(flight_services_router)
api_router.include_router(payments_router)
api_router.include_router(payment_schedules_router)
