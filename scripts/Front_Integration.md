# Frontend Integration and Full Dockerization Instructions

## Objective

Integrate the existing React/TanStack frontend inside the main `Sales_Intelligence_Platform` repository and dockerize the complete platform.

The final goal is to run everything with Docker only, without running frontend or backend commands locally.

Final architecture:

```text
PostgreSQL
    ↓
Bronze / Silver / Gold / Analytics
    ↓
FastAPI Backend
    ↓
React / TanStack Frontend
```

---

## Current Situation

The backend/data project already contains:

```text
Sales_Intelligence_Platform/
├── api/
├── scripts/
├── datasets/
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── README.md
```

The frontend has already been copied into the backend repository.

---

## Required Final Structure

Create/organize the frontend inside a dedicated root folder:

```text
frontend/
```

Final structure must be:

```text
Sales_Intelligence_Platform/
│
├── api/
│   ├── main.py
│   ├── database.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
├── frontend/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── .prettierignore
│   ├── .prettierrc
│   ├── bun.lock
│   ├── bunfig.toml
│   ├── components.json
│   ├── eslint.config.js
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .lovable/
│   └── src/
│
├── scripts/
├── datasets/
├── documents/
├── Data_Catalog.md
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── README.md
└── LICENSE
```

Important:

If frontend files are currently placed directly in the root, move them into `frontend/`.

Do not mix frontend files with backend/data files.

---

# Frontend Environment

Inside `frontend/.env.example`, use:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Inside `frontend/.env`, use:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Important explanation:

The frontend JavaScript runs in the browser, not inside Docker.
Therefore, the browser must call:

```text
http://localhost:8000
```

Do not use:

```text
http://api_dashboard:8000
```

because the browser cannot resolve Docker internal container names.

---

# Create `frontend/Dockerfile`

Use Bun because the frontend project uses `bun.lock`.

Create:

```dockerfile
FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile


FROM oven/bun:1 AS runner

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 5173

CMD ["bun", "run", "dev", "--host", "0.0.0.0"]
```

This Dockerfile runs the frontend in development mode inside Docker.

---

# Create `frontend/.dockerignore`

Create:

```text
node_modules
dist
.build
.output
.env.local
.DS_Store
.git
.gitignore
```

---

# Update Root `docker-compose.yml`

Add a new service:

```yaml
  frontend_dashboard:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: frontend_dashboard
    ports:
      - "5173:5173"
    environment:
      - VITE_API_BASE_URL=http://localhost:8000
    depends_on:
      - api_dashboard
    networks:
      - data_network
```

Final services should be:

```text
postgres_db
pgadmin_gui
etl_pipeline
api_dashboard
frontend_dashboard
```

Do not remove existing services.

Make sure all services use the same network:

```text
data_network
```

---

# Expected Docker Commands

From the root of the project:

```bash
docker-compose down
```

Then:

```bash
docker-compose up -d --build
```

Check running containers:

```bash
docker ps
```

Expected containers:

```text
my_learning_db
my_learning_gui
my_etl_pipeline
api_dashboard
frontend_dashboard
```

---

# Access URLs

After startup:

```text
Frontend Dashboard:
http://localhost:5173

FastAPI:
http://localhost:8000

Swagger:
http://localhost:8000/docs

pgAdmin:
http://localhost:5050
```

---

# Backend Dependency

Before testing the frontend with real data, make sure the data pipeline has already been executed:

```bash
docker-compose exec etl_pipeline python scripts/bronze/load_bronze.py
docker-compose exec etl_pipeline python scripts/silver/load_silver.py
docker-compose exec etl_pipeline python scripts/analytics/load_analytics.py
```

Gold SQL may still need to be executed if it is not automated yet.

If the analytics views already exist in PostgreSQL, only run:

```bash
docker-compose exec etl_pipeline python scripts/analytics/load_analytics.py
```

---

# Frontend Data Connection

The frontend must call the FastAPI backend using:

```text
http://localhost:8000
```

Expected frontend API flow:

```text
React Frontend
    ↓
Axios / React Query
    ↓
http://localhost:8000/api/...
    ↓
FastAPI
    ↓
PostgreSQL analytics views
```

---

# Required Tests

After Docker startup, test:

## 1. API health

Open:

```text
http://localhost:8000/health
```

Expected:

```json
{
  "api_status": "healthy",
  "database_status": 1
}
```

## 2. API KPIs

Open:

```text
http://localhost:8000/api/kpis
```

Expected fields:

```json
{
  "total_revenue": 29351258,
  "total_orders": 27657,
  "total_customers": 18482
}
```

## 3. Frontend

Open:

```text
http://localhost:5173
```

Expected:

* Dashboard loads successfully.
* KPI cards are visible.
* Charts are visible.
* No frontend crash.
* If FastAPI is reachable, the UI should not show "Demo Data".
* If FastAPI is unreachable, the UI may show "Demo Data".

---

# Important Cleanup

Make sure:

1. No duplicated frontend files remain in the root.
2. Frontend files are only inside `frontend/`.
3. Backend API stays inside `api/`.
4. Data pipeline stays inside `scripts/`.
5. Root `README.md` is updated to mention the new `frontend/` folder.
6. Frontend `README.md` remains inside `frontend/README.md`.

---

# Final Expected Architecture

```text
Sales_Intelligence_Platform/
│
├── api/                    # FastAPI backend
├── frontend/               # React/TanStack dashboard
├── scripts/                # Data warehouse pipeline
├── datasets/               # Source CSV files
├── docker-compose.yml      # Full platform orchestration
└── README.md
```

Final platform:

```text
PostgreSQL + pgAdmin + ETL + FastAPI + Frontend
```

Everything must run through Docker Compose only.
