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
```

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

## Prerequisites

Before starting the API, ensure the full pipeline has been executed:

```text
Bronze → Silver → Gold → Analytics
```

Especially the Analytics Layer creation:

```bash
docker-compose exec etl_pipeline python scripts/analytics/load_analytics.py
```

Otherwise the `analytics` views will not exist and the API will return errors.

---

## Run with Docker Compose

From the project root:

```bash
docker-compose up -d --build api_dashboard
```

---

## API Documentation

Once running, open the interactive Swagger UI:

```text
http://localhost:8000/docs
```

Or the ReDoc interface:

```text
http://localhost:8000/redoc
```

---

## Health Check

```text
http://localhost:8000/health
```

Expected response:

```json
{
  "api_status": "healthy",
  "database_status": 1
}
```

---

## Files

| File              | Purpose                            |
| ----------------- | ---------------------------------- |
| `main.py`         | FastAPI application and endpoints  |
| `database.py`     | PostgreSQL connection helpers      |
| `requirements.txt`| Python dependencies                |
| `Dockerfile`      | Docker image for the API service   |
| `README.md`       | This documentation                 |
