# +MundoTravel API

Backend de la aplicacion interna de +MundoTravel, construido con FastAPI, SQLAlchemy 2 y PostgreSQL. Alembic administra todos los cambios del esquema; la aplicacion no crea tablas automaticamente.

## Requisitos

- Python 3.11 o superior.
- PostgreSQL 15 o superior recomendado.

## Preparacion en Windows PowerShell

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
Copy-Item .env.example .env
```

En macOS o Linux, activa el entorno con `source .venv/bin/activate` y copia el archivo con `cp .env.example .env`.

## Configurar PostgreSQL

Crea un usuario y una base local (puedes cambiar estos valores en tu `.env`):

```sql
CREATE USER mundotravel WITH PASSWORD 'mundotravel';
CREATE DATABASE mundotravel OWNER mundotravel;
```

La conexion de desarrollo incluida en `.env.example` es:

```env
DATABASE_URL=postgresql+psycopg://mundotravel:mundotravel@localhost:5432/mundotravel
```

No utilices estas credenciales de ejemplo en produccion.

## Migraciones

```powershell
# Aplicar todas las migraciones pendientes
alembic upgrade head

# Crear una migracion despues de modificar modelos
alembic revision --autogenerate -m "descripcion del cambio"

# Revertir la ultima migracion
alembic downgrade -1

# Consultar revision e historial
alembic current
alembic history
```

## Ejecutar la API

Desde `backend/`:

```powershell
uvicorn app.main:app --reload
```

La API estara disponible en `http://127.0.0.1:8000`.

## Datos minimos de desarrollo

Las cotizaciones requieren una sucursal y un vendedor. El seed es manual e idempotente:

```powershell
python -m scripts.seed_dev
```

Crea o reutiliza solamente:

- Sucursal: `+MundoTravel Principal`
- Vendedor: `Frida` (`frida@mundotravel.local`)

El `password_hash` del vendedor es un marcador no utilizable; la autenticacion aun no existe.

## Ejecutar pruebas

```powershell
pytest
```

## URLs disponibles

- `GET /` - mensaje basico del servicio.
- `GET /api/v1/health` - estado de salud (no depende de PostgreSQL).
- `/docs` - documentacion Swagger UI.
- `/redoc` - documentacion ReDoc.

### Clientes

- `POST /api/v1/clients`
- `GET /api/v1/clients`
- `GET /api/v1/clients/{client_id}`
- `PATCH /api/v1/clients/{client_id}`

El listado acepta `search`, `status`, `limit` y `offset`.

Ejemplo para crear un cliente:

```json
{
  "first_name": "Mariana",
  "last_name": "Sánchez",
  "phone": "8112345678",
  "email": "mariana@example.com",
  "notes": "Cliente de desarrollo"
}
```

### Cotizaciones

- `POST /api/v1/quotes`
- `GET /api/v1/quotes`
- `GET /api/v1/quotes/{quote_id}`
- `PATCH /api/v1/quotes/{quote_id}`

El listado acepta `search`, `status`, `client_id`, `seller_id`, `branch_id`, `departure_from`, `departure_to`, `limit` y `offset`.

Los folios son generados en el backend mediante una secuencia PostgreSQL. Los precios y saldos comienzan en `0.00` y no se aceptan en las solicitudes de creación o actualización.

## Probar desde Swagger

1. Ejecuta `python -m scripts.seed_dev`.
2. Inicia Uvicorn.
3. Abre `http://127.0.0.1:8000/docs`.
4. Crea un cliente y copia su `id`.
5. Usa los ids mostrados por el seed para `seller_id` y `branch_id`.
6. Crea y consulta una cotizacion desde la seccion `Quotes`.

El script `python -m scripts.verify_phase17` ejecuta el flujo REST de verificacion y confirma directamente la persistencia en PostgreSQL. Crea registros claramente identificados como verificacion.

CORS permite durante desarrollo unicamente el origen configurado en `FRONTEND_ORIGIN`, cuyo valor predeterminado es `http://localhost:5173`.

Los totales monetarios almacenados en `quotes` (`net_price`, `public_price`, `total_paid` y `remaining_balance`) seran mantenidos exclusivamente por logica del backend en fases posteriores. El frontend nunca sera la fuente de verdad.

El frontend todavia utiliza datos mock y no consume estos endpoints.

## Servicios de viaje

Los servicios se administran dentro de su cotizacion:

- `/api/v1/quotes/{quote_id}/hotels`
- `/api/v1/quotes/{quote_id}/tours`
- `/api/v1/quotes/{quote_id}/transports`
- `/api/v1/quotes/{quote_id}/flights`

Cada recurso admite:

- `POST` en la coleccion para crear.
- `GET` en la coleccion para listar.
- `GET /{service_id}` para consultar.
- `PATCH /{service_id}` para actualizar parcialmente.
- `DELETE /{service_id}` para eliminar con respuesta `204`.

Ejemplo de hotel:

```json
{
  "purchase_method": "Gestion interna",
  "hotel_name": "Hotel Centro",
  "check_in": "2027-01-10",
  "check_out": "2027-01-15",
  "plan": "Todo incluido",
  "rooms": 1,
  "operator": "+MundoTravel",
  "net_price": "1000.00",
  "public_price": "1200.00"
}
```

Ejemplo de vuelo redondo:

```json
{
  "purchase_method": "Gestion interna",
  "trip_type": "round",
  "origin": "MTY",
  "destination": "CUN",
  "departure_datetime": "2027-01-10T08:00:00-06:00",
  "return_datetime": "2027-01-15T18:00:00-06:00",
  "airline": "Aerolinea Demo",
  "outbound_flight_number": "DM100",
  "return_flight_number": "DM101",
  "net_price": "2000.00",
  "public_price": "2500.00"
}
```

Despues de cada alta, cambio o eliminacion, el backend suma en PostgreSQL los hoteles, tours, transportes y vuelos. Actualiza atomicamente `quotes.net_price`, `quotes.public_price` y `quotes.remaining_balance`. `total_paid` no cambia en esta fase y el frontend nunca es la fuente de verdad.

`GET /api/v1/quotes/{quote_id}` incluye las colecciones `hotels`, `tours`, `transports` y `flights`. El listado general conserva una respuesta compacta.

Para probarlo desde Swagger, crea o elige una cotizacion, copia su UUID y utiliza las secciones `Hotels`, `Tours`, `Transports` y `Flights`. El comando siguiente ejecuta el flujo completo de verificacion y limpia los servicios creados al finalizar:

```powershell
python -m scripts.verify_phase18
```

## Abonos y plan de anticipos

Los abonos conservan historial financiero y no ofrecen eliminacion fisica por API:

- `POST /api/v1/quotes/{quote_id}/payments`
- `GET /api/v1/quotes/{quote_id}/payments`
- `GET /api/v1/quotes/{quote_id}/payments/{payment_id}`
- `PATCH /api/v1/quotes/{quote_id}/payments/{payment_id}`

Tipos permitidos: `cash`, `transfer`, `card` y `other`. La unica moneda habilitada es `MXN`.

Solo los abonos con estado `confirmed` participan en `quote.total_paid`. Los estados `pending` y `cancelled` permanecen en el historial pero no afectan el total. Un abono confirmado no puede superar el saldo disponible; para anularlo se cambia su estado a `cancelled` mediante PATCH.

El backend recalcula siempre desde PostgreSQL:

```text
total_paid = SUM(payments.amount WHERE status = confirmed)
remaining_balance = max(public_price - total_paid, 0)
```

Si una modificacion de servicios reduce `public_price` por debajo de `total_paid`, los pagos se conservan, `total_paid` puede ser mayor que el precio y `remaining_balance` queda en cero. Esto representa un sobrepago o ajuste pendiente; no se generan reembolsos automaticamente.

El plan operativo de anticipos permite CRUD completo:

- `POST /api/v1/quotes/{quote_id}/payment-schedule`
- `GET /api/v1/quotes/{quote_id}/payment-schedule`
- `GET /api/v1/quotes/{quote_id}/payment-schedule/{schedule_id}`
- `PATCH /api/v1/quotes/{quote_id}/payment-schedule/{schedule_id}`
- `DELETE /api/v1/quotes/{quote_id}/payment-schedule/{schedule_id}`

No pueden repetirse números de anticipo dentro de una cotizacion. El estado del plan (`pending`, `paid` u `overdue`) se actualiza manualmente: por ahora un Payment no se vincula ni liquida automaticamente una cuota.

`GET /api/v1/quotes/{quote_id}` incluye `payments` y `payment_schedule` junto con los servicios y totales.

Para ejecutar la verificacion financiera completa con datos temporales controlados:

```powershell
python -m scripts.verify_phase19
```
