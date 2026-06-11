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

The platform is implemented using a Medallion Data Architecture.

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
│ Cleansing &     │
│ Transformation  │
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
```

---

# 🛠️ Technology Stack

| Component               | Technology     |
| ----------------------- | -------------- |
| Database                | PostgreSQL 16  |
| ETL / ELT               | Python 3.11    |
| Database Driver         | psycopg2       |
| Containerization        | Docker         |
| Orchestration           | Docker Compose |
| Database Administration | pgAdmin 4      |
| Version Control         | Git & GitHub   |

---

# 🐳 Docker Infrastructure

The platform runs inside an isolated Docker network.

Current containers:

| Container    | Purpose                           |
| ------------ | --------------------------------- |
| postgres_db  | PostgreSQL database engine        |
| pgadmin_gui  | Database administration interface |
| etl_pipeline | ETL orchestration environment     |

Future architecture will include:

| Container          | Purpose                         |
| ------------------ | ------------------------------- |
| api_dashboard      | FastAPI business API            |
| frontend_dashboard | Business Intelligence Dashboard |

---

# 📂 Project Structure

```text
Sales_Intelligence_Platform/
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
│   └── business_analysis/
│       └── 01_gold_business_analysis.sql
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

# 📖 Data Catalog

The complete business glossary and Gold Layer documentation are available in:

```text
Data_Catalog.md
```

---

# 🚀 Running the Project

## 1. Build and Start Infrastructure

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

## 4. Build Silver Layer

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

Run:

```text
scripts/tests/quality_checks_silver.sql
scripts/tests/quality_checks_gold.sql
```

---

## 7. Execute Business Analysis

Run:

```text
scripts/business_analysis/01_gold_business_analysis.sql
```

---

## 8. Stop Infrastructure

```bash
docker-compose stop
```

---

# 📈 Project Roadmap

### Phase 1 — Completed

✅ Bronze Layer

✅ Silver Layer

✅ Gold Layer

✅ Data Quality Validation

✅ Business Analysis

### Phase 2 — In Progress

🔄 Analytics Layer

🔄 KPI Views

🔄 Customer Segmentation

🔄 Product Profitability Analysis

### Phase 3 — Planned

⏳ FastAPI Backend

⏳ REST Analytics API

⏳ Interactive Dashboard

⏳ AI-Assisted Frontend Development

⏳ Fully Dockerized Decision Support Platform

---

# 👨‍💻 Author

**Hamza ADERDOUR**

Data Science & Computer Engineering Student

Faculty of Sciences and Technology – Mohammedia

Morocco
