# 🚴 Sales Intelligence Platform

### Modern Data Warehouse & Decision Support System using PostgreSQL, Python and Docker

---

## 📌 Project Overview

The **Sales Intelligence Platform** is a modern end-to-end Decision Support System built on top of a Data Warehouse architecture following the Medallion approach (**Bronze → Silver → Gold**).

The project was initially inspired by a traditional Microsoft SQL Server Data Warehouse implementation and was completely redesigned using an Open Source stack based on PostgreSQL, Python, and Docker.

Beyond the construction of the Data Warehouse itself, the project introduces a business-oriented analytical layer capable of transforming raw transactional data into actionable insights that support strategic decision-making.

The platform focuses on:

* Sales Performance Analysis
* Product Profitability Analysis
* Customer Behavior Analysis
* Market Performance Evaluation
* Customer Retention Assessment
* Business Intelligence and Decision Support

---

# 🎯 Business Problem

Organizations collect large amounts of transactional data but often struggle to transform it into meaningful business insights.

The objective of this project is to build a centralized analytical platform capable of:

* Integrating heterogeneous CRM and ERP data sources.
* Ensuring data quality and consistency.
* Delivering a unified business-oriented data model.
* Supporting decision-making through advanced analytical queries.
* Providing a foundation for dashboards and business intelligence applications.

---

# 🏗️ Solution Architecture

The platform follows a multi-layer Medallion Architecture extended with a dedicated Analytics Layer for decision support.

```text
Raw Data Sources
        │
        ▼
┌─────────────────┐
│ Bronze Layer    │
│ Raw Ingestion   │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Silver Layer    │
│ Data Cleansing  │
│ & Standardization
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Gold Layer      │
│ Star Schema     │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Business        │
│ Analysis Layer  │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Analytics Layer │
│ KPI & Business  │
│ Views           │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ FastAPI Backend │
│ REST API        │
│ /docs Swagger   │
└─────────────────┘
        │
        ▼
Future
AI Dashboard → Decision Support Platform
```

---

# 🛠️ Technology Stack

| Component               | Technology      |
| ----------------------- | --------------- |
| Database                | PostgreSQL 16   |
| ETL / ELT               | Python 3.11     |
| Database Driver         | psycopg2        |
| REST API Framework      | FastAPI         |
| API Server              | Uvicorn         |
| Containerization        | Docker          |
| Orchestration           | Docker Compose  |
| Database Administration | pgAdmin 4       |
| Version Control         | Git & GitHub    |

---

# 🐳 Docker Infrastructure

The platform runs inside an isolated Docker network (`data_network`).

Current containers:

| Container     | Purpose                            | Port  |
| ------------- | ---------------------------------- | ----- |
| postgres_db   | PostgreSQL database engine         | 5432  |
| pgadmin_gui   | Database administration interface  | 5050  |
| etl_pipeline  | ETL orchestration environment      | —     |
| api_dashboard | FastAPI REST API backend           | 8000  |

Future architecture will include:

| Container          | Purpose                         |
| ------------------ | ------------------------------- |
| frontend_dashboard | AI-generated Business Dashboard |

---

# 📂 Project Structure

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
│   ├── source_crm/
│   └── source_erp/
│
├── documents/
│
├── scripts/
│   ├── bronze/
│   │   ├── ddl_bronze.sql
│   │   └── load_bronze.py
│   │
│   ├── silver/
│   │   ├── init_database.sql
│   │   ├── ddl_silver.sql
│   │   └── load_silver.py
│   │
│   ├── gold/
│   │   └── gold_ddl.sql
│   │
│   ├── tests/
│   │   ├── quality_checks_silver.sql
│   │   └── quality_checks_gold.sql
│   │
│   ├── business_analysis/
│   │   ├── 01_gold_business_analysis.sql
│   │   └── analysis_results.md
│   │
│   └── analytics/
│       ├── 01_create_analytics_schema.sql
│       ├── 02_kpi_overview.sql
│       ├── 03_sales_trend.sql
│       ├── 04_country_performance.sql
│       ├── 05_margin_analysis.sql
│       ├── 06_product_pareto.sql
│       ├── 07_customer_retention.sql
│       ├── 08_customer_rfm.sql
│       ├── 09_customer_profile.sql
│       ├── 10_business_insights.sql
│       ├── load_analytics.py
│       └── README.md
│
├── Data_Catalog.md
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── README.md
└── LICENSE
```

---

# 📥 Bronze Layer

## Objective

Store an exact copy of source data extracted from CRM and ERP systems.

## Key Features

* Raw data preservation.
* Bulk loading using PostgreSQL COPY.
* High-performance ingestion pipeline.
* Separation between ingestion and transformation logic.

---

# 🧹 Silver Layer

## Objective

Transform raw data into clean, validated, and standardized datasets.

## Key Transformations

### Data Cleansing

* Null handling
* Data type conversion
* Outlier correction

### Data Standardization

* Text normalization
* Gender standardization
* Marital status standardization

### Deduplication

Implemented using:

```sql
ROW_NUMBER() OVER(...)
```

### Temporal Processing

Implemented using:

```sql
TO_DATE()
LEAD()
```

---

# 🌟 Gold Layer

## Objective

Provide a business-ready analytical model using a Star Schema.

The Gold Layer contains:

### Dimensions

* `dim_customers`
* `dim_products`

### Fact Table

* `fact_sales`

The model enables fast analytical queries and Business Intelligence reporting.

---

# 📊 Business Analysis from Gold Layer

A dedicated business analysis was performed on top of the Gold Layer in order to validate the analytical model and identify strategic business opportunities.

The complete analysis can be found in:

```text
scripts/business_analysis/01_gold_business_analysis.sql
```

## Dataset Summary

| Metric          |         Value |
| --------------- | ------------: |
| Customers       |        18,484 |
| Products        |           295 |
| Sales Records   |        60,398 |
| Orders          |        27,659 |
| Revenue         | 29.36 Million |
| Analysis Period |   2010 – 2014 |

---

## Key Findings

### Revenue Concentration

* Bikes generate approximately 96% of total revenue.
* Road Bikes and Mountain Bikes dominate sales performance.

### Profitability Analysis

* Accessories produce the highest margin percentage (62.76%).
* Cross-selling opportunities were identified.

### Market Performance

* Australia generates the highest revenue per customer.
* Australian customers spend more than twice the revenue generated by an average US customer.

### Customer Retention

* 63% of customers place only one order.
* 92% place one or two orders.

Retention represents a major business opportunity.

### Product Dependency

A small number of bike models generate a significant share of total revenue, creating concentration risk.

### Customer Growth

Customer acquisition accelerated significantly during 2013, representing the strongest growth period in the dataset.

---

# 💡 Strategic Recommendations

Based on the analysis, the following opportunities were identified:

1. Increase investment in the Australian market.
2. Promote accessory bundles to improve profitability.
3. Improve customer retention through loyalty programs.
4. Reduce dependency on a small set of high-performing products.
5. Investigate the factors behind the strong growth observed during 2013.
6. Introduce customer segmentation using RFM analysis.

---

# 📊 Analytics Layer

## Objective

Transform the Gold Layer into reusable business-oriented analytical views designed to support dashboards, APIs, and decision-making processes.

Unlike the Gold Layer, which provides a generic Star Schema, the Analytics Layer exposes ready-to-consume KPIs and business metrics.

---

## Analytics Views

| View                          | Purpose                         |
| ----------------------------- | ------------------------------- |
| analytics.kpi_overview        | Executive KPIs                  |
| analytics.sales_trend         | Revenue evolution over time     |
| analytics.country_performance | Market performance by country   |
| analytics.margin_analysis     | Product profitability           |
| analytics.product_pareto      | Product concentration analysis  |
| analytics.customer_retention  | Purchase frequency distribution |
| analytics.customer_rfm        | RFM customer segmentation       |
| analytics.customer_profile    | Customer demographics           |
| analytics.business_insights   | Strategic business summary      |

---

## Analytics Automation

The entire Analytics Layer can be generated automatically.

```bash
docker-compose exec etl_pipeline python scripts/analytics/load_analytics.py
```

The automation script:

* Detects all SQL files automatically.
* Executes them in numerical order.
* Commits successful executions.
* Rolls back transactions on failure.
* Produces execution logs for traceability.

This removes the need to execute Analytics scripts manually through pgAdmin.

---

## Validated Business Results

The Analytics Layer produced the following business insights:

| KPI                              |       Value |
| -------------------------------- | ----------: |
| Total Revenue                    |      29.36M |
| Total Orders                     |      27,657 |
| Total Customers                  |      18,482 |
| Sold Products                    |         130 |
| Average Order Value              |    1,061.26 |
| Revenue per Customer             |    1,588.10 |
| Bikes Revenue Share              |      96.46% |
| Highest Margin Category          | Accessories |
| Accessories Margin               |      62.76% |
| Best Market                      |   Australia |
| Revenue per Customer (Australia) |    2,523.02 |
| One-Time Customers               |      62.86% |
| Customers with 1–2 Orders        |      92.37% |
| Best Revenue Year                |        2013 |
| Revenue in 2013                  |      16.34M |

---

## Strategic Insights

The analysis highlighted several important business opportunities:

### Market Expansion

Australia generates the highest revenue per customer despite having fewer customers than the United States.

### Cross-Selling Opportunity

Accessories generate the highest margin percentage and represent an ideal candidate for bundle offers and cross-selling campaigns.

### Customer Retention

More than 60% of customers place only one order.

Improving customer retention could generate significantly more value than acquiring new customers.

### Product Concentration Risk

A small number of bike products generate a large share of revenue, creating dependency on a limited product portfolio.

### Historical Growth Analysis

The year 2013 represents the strongest growth period and should be investigated to understand the drivers behind that expansion.

---

# 🔌 FastAPI Backend

## Objective

Expose the PostgreSQL Analytics Layer as a REST API to serve the future Business Intelligence dashboard.

The API acts as the bridge between the analytics database views and any frontend or external consumer.

```text
PostgreSQL Analytics Views
        ↓
FastAPI REST API  (port 8000)
        ↓
Frontend Dashboard
```

---

## API Endpoints

| Endpoint                     | View queried                    | Description                   |
| ---------------------------- | ------------------------------- | ----------------------------- |
| `GET /`                      | —                               | API root                      |
| `GET /health`                | —                               | Database health check         |
| `GET /api/kpis`              | `analytics.kpi_overview`        | Global executive KPIs         |
| `GET /api/sales/trend`       | `analytics.sales_trend`         | Monthly revenue & orders      |
| `GET /api/countries/performance` | `analytics.country_performance` | Market performance by country |
| `GET /api/margins`           | `analytics.margin_analysis`     | Revenue and margin analysis   |
| `GET /api/products/pareto`   | `analytics.product_pareto`      | Product Pareto analysis       |
| `GET /api/customers/retention` | `analytics.customer_retention` | Purchase frequency            |
| `GET /api/customers/rfm`     | `analytics.customer_rfm`        | RFM customer segmentation     |
| `GET /api/customers/profile` | `analytics.customer_profile`    | Customer demographics         |
| `GET /api/business/insights` | `analytics.business_insights`   | Strategic business summary    |

---

## API Files

| File              | Purpose                                      |
| ----------------- | -------------------------------------------- |
| `api/main.py`     | FastAPI application — all endpoints          |
| `api/database.py` | PostgreSQL helpers (`fetch_all`, `fetch_one`)|
| `api/requirements.txt` | Python dependencies                     |
| `api/Dockerfile`  | Docker image — python:3.11-slim, port 8000   |
| `api/README.md`   | API documentation                            |

---

## Start the API

```bash
docker-compose up -d --build api_dashboard
```

## Access Points

| URL | Description |
|-----|-------------|
| `http://localhost:8000` | API root |
| `http://localhost:8000/health` | Health check |
| `http://localhost:8000/docs` | **Swagger UI** (interactive) |
| `http://localhost:8000/redoc` | ReDoc documentation |

---

# 📖 Data Catalog

The complete business glossary and Gold Layer documentation are available in:

```text
Data_Catalog.md
```

---

# 🚀 Running the Complete Pipeline

## 1. Start Infrastructure

```bash
docker-compose up -d --build
```

---

## 2. Initialize Database

Execute:

```text
scripts/silver/init_database.sql
scripts/bronze/ddl_bronze.sql
```

using pgAdmin.

---

## 3. Load Bronze Layer

```bash
docker-compose exec etl_pipeline python scripts/bronze/load_bronze.py
```

---

## 4. Load Silver Layer

Execute:

```text
scripts/silver/ddl_silver.sql
```

Then run:

```bash
docker-compose exec etl_pipeline python scripts/silver/load_silver.py
```

---

## 5. Build Gold Layer

Execute:

```text
scripts/gold/gold_ddl.sql
```

---

## 6. Execute Quality Checks

```text
scripts/tests/quality_checks_silver.sql
scripts/tests/quality_checks_gold.sql
```

---

## 7. Execute Business Analysis

```text
scripts/business_analysis/01_gold_business_analysis.sql
```

---

## 8. Create Analytics Layer

```bash
docker-compose exec etl_pipeline python scripts/analytics/load_analytics.py
```

---

## 9. Start FastAPI Backend

```bash
docker-compose up -d --build api_dashboard
```

Verify the API is running:

```text
http://localhost:8000/health
http://localhost:8000/docs
```

---

## 10. Stop Infrastructure

```bash
docker-compose stop
```

---

# 📈 Project Roadmap

## Phase 1 — Completed

✅ Bronze Layer

✅ Silver Layer

✅ Gold Layer

✅ Data Quality Validation

✅ Business Analysis

✅ Analytics Layer

✅ KPI Views

✅ Customer Segmentation

✅ Product Profitability Analysis

✅ Analytics Automation

✅ FastAPI Backend

✅ Analytics REST API

✅ Swagger UI Documentation

✅ Dockerized API Service

---

## Phase 2 — Completed

✅ FastAPI Backend

✅ Analytics REST API (11 endpoints)

✅ Swagger UI at `/docs`

✅ Dockerized `api_dashboard` service

✅ CORS enabled for frontend consumption

---

## Phase 3 — Planned

⏳ AI-Generated Frontend (Lovable)

⏳ Executive Dashboard

⏳ Customer Intelligence Dashboard

⏳ Product Intelligence Dashboard

⏳ Strategic Business Dashboard

⏳ End-to-End Decision Support Platform

---

# 👨‍💻 Author

**Hamza ADERDOUR**

Data Science & Computer Engineering Student

Faculty of Sciences and Technology – Mohammedia

Morocco
