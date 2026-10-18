# +MundoTravel frontend

## Desarrollo local

1. Copia `.env.example` como `.env`.
2. Ejecuta `python -m scripts.seed_dev` desde `backend/` y copia el UUID de la sucursal a `VITE_DEFAULT_BRANCH_ID`.
3. Inicia FastAPI en una terminal y Vite en otra.

```powershell
# Terminal 1
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload

# Terminal 2
cd frontend
npm install
npm run dev
```

El dashboard mantiene datos demostrativos porque el backend aún no ofrece un endpoint operativo agregado. Clientes, cotizaciones, servicios, detalle, abonos, plan de anticipos, historial de pagos, documento y próximas salidas consumen la API.

## Inicio de sesión

La aplicación abre en `/login`. El token JWT se conserva en `localStorage` con la clave `mundotravel_access_token`, se adjunta automáticamente como Bearer token y se valida con `/auth/me` al recargar. Un `401` elimina la sesión y regresa al login.

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_DEFAULT_BRANCH_ID=<uuid-de-la-sucursal>
```

El vendedor ya no se configura en Vite: el backend utiliza siempre al usuario autenticado.
