# Analytics Layer

## Overview

The Analytics Layer is built on top of the Gold Layer and transforms the Star Schema into business-ready views.

This layer is designed to support future dashboards, REST API endpoints, and business decision-making.

The Analytics Layer depends only on:

- `gold.fact_sales`
- `gold.dim_customers`
- `gold.dim_products`

It does not query the Bronze or Silver layers directly.

---

## Purpose

The goal of this layer is to provide reusable analytical views for:

- Executive KPIs
- Sales trend analysis
- Country performance analysis
- Product profitability
- Product Pareto analysis
- Customer retention analysis
- RFM customer segmentation
- Customer demographic profiling
- Strategic business insights

---

## Files

| File | View Created | Purpose |
|---|---|---|
| `01_create_analytics_schema.sql` | `analytics` schema | Creates the analytics schema |
| `02_kpi_overview.sql` | `analytics.kpi_overview` | Global business KPIs |
| `03_sales_trend.sql` | `analytics.sales_trend` | Monthly sales trend |
| `04_country_performance.sql` | `analytics.country_performance` | Country-level market performance |
| `05_margin_analysis.sql` | `analytics.margin_analysis` | Revenue and margin analysis |
| `06_product_pareto.sql` | `analytics.product_pareto` | Product revenue concentration |
| `07_customer_retention.sql` | `analytics.customer_retention` | Purchase frequency and retention |
| `08_customer_rfm.sql` | `analytics.customer_rfm` | RFM customer segmentation |
| `09_customer_profile.sql` | `analytics.customer_profile` | Demographic customer analysis |
| `10_business_insights.sql` | `analytics.business_insights` | Strategic business summary |
| `load_analytics.py` | — | Automation script — executes all SQL files in order |

---

## Execution Order

Run the files in this exact order:

```text
01_create_analytics_schema.sql
02_kpi_overview.sql
03_sales_trend.sql
04_country_performance.sql
05_margin_analysis.sql
06_product_pareto.sql
07_customer_retention.sql
08_customer_rfm.sql
09_customer_profile.sql
10_business_insights.sql
```

---

## Validation Queries

After creating the views, run:

```sql
SELECT * FROM analytics.kpi_overview;

SELECT * FROM analytics.sales_trend LIMIT 10;

SELECT * FROM analytics.country_performance;

SELECT * FROM analytics.margin_analysis;

SELECT * FROM analytics.product_pareto LIMIT 20;

SELECT * FROM analytics.customer_retention;

SELECT * FROM analytics.customer_rfm LIMIT 20;

SELECT * FROM analytics.customer_profile;

SELECT * FROM analytics.business_insights;
```

---

## Automation

The Analytics Layer can be created automatically using the Python script:

```bash
docker-compose exec etl_pipeline python scripts/analytics/load_analytics.py
```

This script:

* Connects to PostgreSQL.
* Detects all SQL files in the analytics folder.
* Executes them in numerical order.
* Commits each file after successful execution.
* Rolls back the transaction if an error occurs.
* Prints execution logs for traceability.

The execution order is controlled by the numeric prefixes of the SQL files.

---

## Validated Business Results

The Analytics Layer produced the following validated insights:

| KPI                                 |       Value |
| ----------------------------------- | ----------: |
| Total Revenue                       |      29.36M |
| Total Orders                        |      27,657 |
| Total Customers                     |      18,482 |
| Sold Products                       |         130 |
| Average Order Value                 |    1,061.26 |
| Revenue per Customer                |    1,588.10 |
| Bikes Revenue Share                 |      96.46% |
| Highest Margin Category             | Accessories |
| Accessories Margin                  |      62.76% |
| Best Market by Revenue per Customer |   Australia |
| Australia Revenue per Customer      |    2,523.02 |
| One-Time Customers                  |      62.86% |
| Customers with One or Two Orders    |      92.37% |
| Best Revenue Year                   |        2013 |
| 2013 Revenue                        |      16.34M |

---

## Business Interpretation

The Analytics Layer confirms that:

1. The business is highly dependent on Bikes, which generate 96.46% of total revenue.
2. Accessories represent the highest-margin category and should be promoted through cross-selling.
3. Australia is the most valuable market in terms of revenue per customer.
4. Customer retention is a major opportunity because most customers place only one or two orders.
5. A limited number of products generate a large share of revenue, creating product concentration risk.
6. 2013 was the strongest business year in the dataset.

---

## Next Step

The next step is to expose these analytical views through a FastAPI backend and connect them to an AI-assisted dashboard frontend.
