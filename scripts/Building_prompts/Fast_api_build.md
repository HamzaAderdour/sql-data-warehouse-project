# FastAPI Backend Implementation Instructions

## Objective

Add a FastAPI backend to expose the existing `analytics` PostgreSQL views through REST API endpoints.

The backend will serve as the bridge between:

```text
PostgreSQL Analytics Layer
        ↓
FastAPI REST API
        ↓
Future Lovable Dashboard Frontend
```

---

## Current Project Structure

```text
Sales_Intelligence_Platform/
│
├── datasets/
├── documents/
├── scripts/
│   ├── bronze/
│   ├── silver/
│   ├── gold/
│   ├── tests/
│   ├── business_analysis/
│   └── analytics/
│
├── Data_Catalog.md
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── README.md
└── LICENSE
```

---

## Required New Structure

Create a new folder at the project root:

```text
api/
```

Final structure:

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
├── datasets/
├── documents/
├── scripts/
│   ├── bronze/
│   ├── silver/
│   ├── gold/
│   ├── tests/
│   ├── business_analysis/
│   └── analytics/
│
├── Data_Catalog.md
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── README.md
└── LICENSE
```

---

# Important Rules

## Do not modify existing layers

Do not modify:

```text
scripts/bronze/
scripts/silver/
scripts/gold/
scripts/tests/
scripts/business_analysis/
scripts/analytics/
```

Only add:

```text
api/
```

And update:

```text
docker-compose.yml
```

to include the new API service.

---

# Database Connection

Use these PostgreSQL parameters inside the API:

```python
DB_PARAMS = {
    "host": "postgres_db",
    "port": "5432",
    "dbname": "bid_project_db",
    "user": "admin",
    "password": "mysecretpassword"
}
```

Important:

Because the API will run inside Docker, the database host must be:

```text
postgres_db
```

not `localhost`.

---

# Required API Endpoints

Create the following endpoints:

```text
GET /
GET /health

GET /api/kpis
GET /api/sales/trend
GET /api/countries/performance
GET /api/margins
GET /api/products/pareto
GET /api/customers/retention
GET /api/customers/rfm
GET /api/customers/profile
GET /api/business/insights
```

---

# Endpoint Mapping

| Endpoint                     | PostgreSQL View                 |
| ---------------------------- | ------------------------------- |
| `/api/kpis`                  | `analytics.kpi_overview`        |
| `/api/sales/trend`           | `analytics.sales_trend`         |
| `/api/countries/performance` | `analytics.country_performance` |
| `/api/margins`               | `analytics.margin_analysis`     |
| `/api/products/pareto`       | `analytics.product_pareto`      |
| `/api/customers/retention`   | `analytics.customer_retention`  |
| `/api/customers/rfm`         | `analytics.customer_rfm`        |
| `/api/customers/profile`     | `analytics.customer_profile`    |
| `/api/business/insights`     | `analytics.business_insights`   |

---

# File 1 — `api/requirements.txt`

Create:

```txt
fastapi==0.115.6
uvicorn[standard]==0.32.1
psycopg2-binary==2.9.10
python-dotenv==1.0.1
```

---

# File 2 — `api/database.py`

Create:

```python
import psycopg2
from psycopg2.extras import RealDictCursor


DB_PARAMS = {
    "host": "postgres_db",
    "port": "5432",
    "dbname": "bid_project_db",
    "user": "admin",
    "password": "mysecretpassword"
}


def get_connection():
    """
    Create and return a PostgreSQL database connection.
    """
    return psycopg2.connect(**DB_PARAMS)


def fetch_all(query: str):
    """
    Execute a SELECT query and return all rows as a list of dictionaries.
    """
    connection = None

    try:
        connection = get_connection()

        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query)
            results = cursor.fetchall()
            return [dict(row) for row in results]

    finally:
        if connection is not None:
            connection.close()


def fetch_one(query: str):
    """
    Execute a SELECT query and return one row as a dictionary.
    """
    connection = None

    try:
        connection = get_connection()

        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query)
            result = cursor.fetchone()
            return dict(result) if result else {}

    finally:
        if connection is not None:
            connection.close()
```

---

# File 3 — `api/main.py`

Create:

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import fetch_all, fetch_one


app = FastAPI(
    title="Sales Intelligence Platform API",
    description="REST API exposing Analytics Layer views from PostgreSQL.",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Sales Intelligence Platform API",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    try:
        result = fetch_one("SELECT 1 AS database_status;")
        return {
            "api_status": "healthy",
            "database_status": result.get("database_status")
        }
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {error}"
        )


@app.get("/api/kpis")
def get_kpis():
    return fetch_one("SELECT * FROM analytics.kpi_overview;")


@app.get("/api/sales/trend")
def get_sales_trend():
    return fetch_all("SELECT * FROM analytics.sales_trend ORDER BY sales_month;")


@app.get("/api/countries/performance")
def get_country_performance():
    return fetch_all("SELECT * FROM analytics.country_performance ORDER BY revenue DESC;")


@app.get("/api/margins")
def get_margin_analysis():
    return fetch_all("SELECT * FROM analytics.margin_analysis ORDER BY estimated_margin DESC;")


@app.get("/api/products/pareto")
def get_product_pareto():
    return fetch_all("SELECT * FROM analytics.product_pareto ORDER BY product_rank;")


@app.get("/api/customers/retention")
def get_customer_retention():
    return fetch_all("SELECT * FROM analytics.customer_retention ORDER BY purchase_frequency;")


@app.get("/api/customers/rfm")
def get_customer_rfm():
    return fetch_all("SELECT * FROM analytics.customer_rfm ORDER BY monetary DESC;")


@app.get("/api/customers/profile")
def get_customer_profile():
    return fetch_all("SELECT * FROM analytics.customer_profile ORDER BY revenue DESC NULLS LAST;")


@app.get("/api/business/insights")
def get_business_insights():
    return fetch_one("SELECT * FROM analytics.business_insights;")
```

---

# File 4 — `api/Dockerfile`

Create:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

# File 5 — `api/README.md`

Create:

````md
# Sales Intelligence Platform API

## Overview

This FastAPI backend exposes the PostgreSQL Analytics Layer as REST API endpoints.

It connects to the existing PostgreSQL container and reads data from:

- `analytics.kpi_overview`
- `analytics.sales_trend`
- `analytics.country_performance`
- `analytics.margin_analysis`
- `analytics.product_pareto`
- `analytics.customer_retention`
- `analytics.customer_rfm`
- `analytics.customer_profile`
- `analytics.business_insights`

---

## Purpose

The API acts as the backend service for the future Business Intelligence dashboard.

```text
PostgreSQL Analytics Views
        ↓
FastAPI REST API
        ↓
Frontend Dashboard
````

---

## Endpoints

| Endpoint                     | Description                   |
| ---------------------------- | ----------------------------- |
| `/`                          | API root                      |
| `/health`                    | API and database health check |
| `/api/kpis`                  | Global executive KPIs         |
| `/api/sales/trend`           | Monthly sales trend           |
| `/api/countries/performance` | Country performance           |
| `/api/margins`               | Revenue and margin analysis   |
| `/api/products/pareto`       | Product Pareto analysis       |
| `/api/customers/retention`   | Customer retention analysis   |
| `/api/customers/rfm`         | RFM customer segmentation     |
| `/api/customers/profile`     | Customer demographic profile  |
| `/api/business/insights`     | Strategic business insights   |

---

## Run with Docker Compose

From the project root:

```bash
docker-compose up -d --build api_dashboard
```

---

## API Documentation

Once running, open:

```text
http://localhost:8000/docs
```

---

## Health Check

```text
http://localhost:8000/health
```

````

---

# Update `docker-compose.yml`

Add this new service:

```yaml
  api_dashboard:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: api_dashboard
    ports:
      - "8000:8000"
    depends_on:
      - postgres_db
    networks:
      - data_network
````

Important:

Make sure it is aligned with the existing services indentation.

Do not remove or rename existing services.

---

# Expected Final `docker-compose.yml` Logic

The project should now contain four services:

```text
postgres_db
pgadmin_gui
etl_pipeline
api_dashboard
```

The API must use the same Docker network as PostgreSQL:

```text
data_network
```

---

# Testing Instructions

After implementation, run:

```bash
docker-compose up -d --build api_dashboard
```

Then test:

```text
http://localhost:8000
http://localhost:8000/health
http://localhost:8000/docs
http://localhost:8000/api/kpis
http://localhost:8000/api/business/insights
```

Expected health response:

```json
{
  "api_status": "healthy",
  "database_status": 1
}
```

---

# Important Notes

Before testing the API, make sure the following pipeline has already been executed:

```text
Bronze → Silver → Gold → Analytics
```

Especially make sure this command has already succeeded:

```bash
docker-compose exec etl_pipeline python scripts/analytics/load_analytics.py
```

Otherwise, the API will fail because the `analytics` views will not exist yet.

---

# Final Expected Result

After implementation, the project must support:

```text
PostgreSQL
    ↓
Gold Layer
    ↓
Analytics Layer
    ↓
FastAPI REST API
```

The API must be ready to be consumed by the future AI-generated frontend dashboard.
