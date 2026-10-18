# Deployment del backend en Render

El archivo render.yaml de la raiz crea el Web Service y Render PostgreSQL como Blueprint. La base se conecta mediante su URL interna, Alembic aplica las migraciones antes de iniciar la aplicacion y el health check apunta a /api/v1/health.

## Configuracion del servicio

- Root Directory: backend
- Runtime: Python
- Python: serie 3.11 indicada en .python-version
- Build Command: pip install .
- Pre-Deploy Command: alembic upgrade head
- Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
- Health Check Path: /api/v1/health

Render entrega una URL con formato postgresql://. Settings la normaliza centralmente a postgresql+psycopg://, por lo que no debes transformar ni copiar credenciales en otros archivos.

## Variables de produccion

    APP_NAME=+MundoTravel API
    APP_ENV=production
    API_V1_PREFIX=/api/v1
    DATABASE_URL=<Internal Database URL de Render PostgreSQL>
    AUTH_SECRET_KEY=<valor aleatorio largo>
    ACCESS_TOKEN_EXPIRE_MINUTES=480
    JWT_ALGORITHM=HS256
    FRONTEND_ORIGIN=https://tu-frontend.vercel.app

El Blueprint genera AUTH_SECRET_KEY automaticamente. Si configuras el servicio manualmente, genera una clave diferente de cualquier password humana:

    python -c "import secrets; print(secrets.token_urlsafe(64))"

Pegala solamente en Render. Nunca la agregues a Git ni a logs. FRONTEND_ORIGIN debe contener la URL exacta que Vercel asigne en la Fase 22B; no uses comodines con autenticacion.

## Pasos exactos en el Dashboard

1. Sube estos cambios al repositorio conectado a GitHub.
2. En Render elige New > Blueprint y selecciona el repositorio. Render encontrara render.yaml en la raiz.
3. Revisa los recursos mundotravel-api y mundotravel-db. Conserva ambos en la misma region.
4. Cuando Render lo solicite, asigna FRONTEND_ORIGIN. Puedes reemplazarlo cuando exista la URL definitiva de Vercel.
5. Crea los recursos. DATABASE_URL se enlaza automaticamente con la URL interna de PostgreSQL y AUTH_SECRET_KEY se genera sin guardarse en Git.
6. Confirma en los logs que pip install . termine, que alembic upgrade head aplique las migraciones y que Uvicorn escuche en 0.0.0.0:$PORT.

Si prefieres configuracion manual, crea primero New > PostgreSQL. Despues crea New > Web Service, conecta el repositorio y copia los valores de la seccion Configuracion del servicio. En DATABASE_URL usa Internal Database URL, no la URL externa.

## Primer usuario

No ejecutes scripts.seed_dev en produccion. Agrega temporalmente estas variables al Web Service:

    INITIAL_USER_NAME=<nombre>
    INITIAL_USER_EMAIL=<correo>
    INITIAL_USER_PASSWORD=<password seguro de al menos 12 caracteres>

Desde Render Shell, una vez aplicadas las migraciones, ejecuta:

    python -m scripts.seed_initial_user

El comando es idempotente. Si el correo existe, no cambia sus credenciales ni relaciones. Al terminar elimina las tres variables INITIAL_USER_* del servicio.

## Verificacion

Sustituye URL-RENDER por el dominio asignado:

    https://URL-RENDER/api/v1/health
    https://URL-RENDER/docs

El health debe responder 200. En Swagger:

1. Ejecuta POST /api/v1/auth/login.
2. Autoriza Swagger con el token.
3. Ejecuta GET /api/v1/auth/me.
4. Prueba una ruta protegida.
5. Crea un cliente y una cotizacion.
6. Reinicia el Web Service y confirma que los registros persistan.

Los datos deben vivir en Render PostgreSQL. No guardes informacion persistente en el filesystem efimero del Web Service.
