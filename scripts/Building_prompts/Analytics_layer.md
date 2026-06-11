# Analytics Layer Implementation Instructions

## Objective

Add a new `analytics` layer to the existing `Sales_Intelligence_Platform` project.

This layer must be built on top of the existing Gold Layer and must contain SQL views designed for decision support, dashboarding, and future API consumption.

The Analytics Layer must not modify the existing Bronze, Silver, or Gold layers.
It must only create a new PostgreSQL schema named `analytics` and define business-ready SQL views from the existing Gold views/tables.

---

## Current Project Structure

The current structure is:

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
│       ├── 01_gold_business_analysis.sql
│       └── analysis_results.md
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

Create the following new folder:

```text
scripts/analytics/
```

The final structure must become:

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

# Important Rules

## Do not modify existing layers

Do not edit:

```text
scripts/bronze/
scripts/silver/
scripts/gold/
scripts/tests/
scripts/business_analysis/
```

Only add the new folder:

```text
scripts/analytics/
```

---

## SQL Compatibility

All SQL files must be compatible with PostgreSQL.

Use:

```sql
CREATE OR REPLACE VIEW
```

for all analytical views.

Use:

```sql
CREATE SCHEMA IF NOT EXISTS analytics;
```

for the analytics schema.

---

## Gold Layer Dependency

The Analytics Layer must use only the existing Gold Layer objects:

```text
gold.fact_sales
gold.dim_customers
gold.dim_products
```

Do not query Bronze or Silver directly.

---

# Files to Create

---

## 1. `scripts/analytics/01_create_analytics_schema.sql`

Purpose:

Create the PostgreSQL schema dedicated to analytical business views.

Content:

```sql
CREATE SCHEMA IF NOT EXISTS analytics;
```

---

## 2. `scripts/analytics/02_kpi_overview.sql`

Purpose:

Create a global KPI view used by the Executive Overview dashboard.

Expected view:

```text
analytics.kpi_overview
```

Content:

```sql
CREATE OR REPLACE VIEW analytics.kpi_overview AS
SELECT
    SUM(sales_amount) AS total_revenue,
    COUNT(DISTINCT order_number) AS total_orders,
    COUNT(DISTINCT customer_key) AS total_customers,
    COUNT(DISTINCT product_key) AS sold_products,
    SUM(quantity) AS total_quantity,
    ROUND(SUM(sales_amount)::numeric / NULLIF(COUNT(DISTINCT order_number), 0), 2) AS average_order_value,
    ROUND(SUM(sales_amount)::numeric / NULLIF(COUNT(DISTINCT customer_key), 0), 2) AS revenue_per_customer,
    MIN(order_date) AS first_order_date,
    MAX(order_date) AS last_order_date
FROM gold.fact_sales
WHERE order_date IS NOT NULL;
```

---

## 3. `scripts/analytics/03_sales_trend.sql`

Purpose:

Create a monthly sales trend view for revenue, orders and quantity analysis.

Expected view:

```text
analytics.sales_trend
```

Content:

```sql
CREATE OR REPLACE VIEW analytics.sales_trend AS
SELECT
    DATE_TRUNC('month', order_date)::date AS sales_month,
    EXTRACT(YEAR FROM order_date)::int AS sales_year,
    EXTRACT(MONTH FROM order_date)::int AS month_number,
    SUM(sales_amount) AS revenue,
    COUNT(DISTINCT order_number) AS orders,
    SUM(quantity) AS quantity_sold,
    ROUND(SUM(sales_amount)::numeric / NULLIF(COUNT(DISTINCT order_number), 0), 2) AS average_order_value
FROM gold.fact_sales
WHERE order_date IS NOT NULL
GROUP BY
    DATE_TRUNC('month', order_date),
    EXTRACT(YEAR FROM order_date),
    EXTRACT(MONTH FROM order_date)
ORDER BY sales_month;
```

---

## 4. `scripts/analytics/04_country_performance.sql`

Purpose:

Create a country-level performance view to identify the strongest markets.

Expected view:

```text
analytics.country_performance
```

Content:

```sql
CREATE OR REPLACE VIEW analytics.country_performance AS
SELECT
    c.country,
    COUNT(DISTINCT c.customer_key) AS customers,
    COUNT(DISTINCT f.order_number) AS orders,
    SUM(f.sales_amount) AS revenue,
    SUM(f.quantity) AS quantity_sold,
    ROUND(SUM(f.sales_amount)::numeric / NULLIF(COUNT(DISTINCT c.customer_key), 0), 2) AS revenue_per_customer,
    ROUND(SUM(f.sales_amount)::numeric / NULLIF(COUNT(DISTINCT f.order_number), 0), 2) AS average_order_value
FROM gold.fact_sales f
JOIN gold.dim_customers c
    ON f.customer_key = c.customer_key
GROUP BY c.country
ORDER BY revenue DESC;
```

---

## 5. `scripts/analytics/05_margin_analysis.sql`

Purpose:

Create a profitability view by category and subcategory.

Expected view:

```text
analytics.margin_analysis
```

Content:

```sql
CREATE OR REPLACE VIEW analytics.margin_analysis AS
SELECT
    p.category,
    p.subcategory,
    SUM(f.sales_amount) AS revenue,
    SUM(f.quantity * p.cost) AS estimated_cost,
    SUM(f.sales_amount) - SUM(f.quantity * p.cost) AS estimated_margin,
    ROUND(
        (SUM(f.sales_amount) - SUM(f.quantity * p.cost))::numeric
        / NULLIF(SUM(f.sales_amount), 0) * 100,
        2
    ) AS margin_percentage,
    SUM(f.quantity) AS quantity_sold,
    COUNT(DISTINCT f.order_number) AS orders
FROM gold.fact_sales f
JOIN gold.dim_products p
    ON f.product_key = p.product_key
GROUP BY
    p.category,
    p.subcategory
ORDER BY estimated_margin DESC;
```

---

## 6. `scripts/analytics/06_product_pareto.sql`

Purpose:

Create a product concentration and Pareto analysis view.

Expected view:

```text
analytics.product_pareto
```

Content:

```sql
CREATE OR REPLACE VIEW analytics.product_pareto AS
WITH product_revenue AS (
    SELECT
        p.product_key,
        p.product_name,
        p.category,
        p.subcategory,
        SUM(f.sales_amount) AS revenue,
        SUM(f.quantity) AS quantity_sold,
        COUNT(DISTINCT f.order_number) AS orders
    FROM gold.fact_sales f
    JOIN gold.dim_products p
        ON f.product_key = p.product_key
    GROUP BY
        p.product_key,
        p.product_name,
        p.category,
        p.subcategory
),
ranked_products AS (
    SELECT
        product_key,
        product_name,
        category,
        subcategory,
        revenue,
        quantity_sold,
        orders,
        SUM(revenue) OVER () AS total_revenue,
        SUM(revenue) OVER (
            ORDER BY revenue DESC
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS cumulative_revenue,
        ROW_NUMBER() OVER (ORDER BY revenue DESC) AS product_rank
    FROM product_revenue
)
SELECT
    product_rank,
    product_key,
    product_name,
    category,
    subcategory,
    revenue,
    quantity_sold,
    orders,
    ROUND(revenue::numeric / NULLIF(total_revenue, 0) * 100, 2) AS revenue_percentage,
    ROUND(cumulative_revenue::numeric / NULLIF(total_revenue, 0) * 100, 2) AS cumulative_revenue_percentage
FROM ranked_products
ORDER BY product_rank;
```

---

## 7. `scripts/analytics/07_customer_retention.sql`

Purpose:

Create a purchase frequency distribution view to analyze customer retention.

Expected view:

```text
analytics.customer_retention
```

Content:

```sql
CREATE OR REPLACE VIEW analytics.customer_retention AS
WITH customer_frequency AS (
    SELECT
        customer_key,
        COUNT(DISTINCT order_number) AS purchase_frequency,
        SUM(sales_amount) AS customer_revenue
    FROM gold.fact_sales
    GROUP BY customer_key
),
frequency_distribution AS (
    SELECT
        purchase_frequency,
        COUNT(*) AS customers,
        SUM(customer_revenue) AS revenue
    FROM customer_frequency
    GROUP BY purchase_frequency
),
total_customers AS (
    SELECT COUNT(*) AS total_customers
    FROM customer_frequency
)
SELECT
    fd.purchase_frequency,
    fd.customers,
    fd.revenue,
    ROUND(fd.customers::numeric / NULLIF(tc.total_customers, 0) * 100, 2) AS customer_percentage
FROM frequency_distribution fd
CROSS JOIN total_customers tc
ORDER BY fd.purchase_frequency;
```

---

## 8. `scripts/analytics/08_customer_rfm.sql`

Purpose:

Create an RFM customer segmentation view.

Important:

Use the maximum order date in the dataset as the reference date, not `CURRENT_DATE`, because the dataset is historical.

Expected view:

```text
analytics.customer_rfm
```

Content:

```sql
CREATE OR REPLACE VIEW analytics.customer_rfm AS
WITH max_date AS (
    SELECT MAX(order_date) AS reference_date
    FROM gold.fact_sales
    WHERE order_date IS NOT NULL
),
rfm AS (
    SELECT
        c.customer_key,
        c.customer_number,
        c.first_name,
        c.last_name,
        c.country,
        max_date.reference_date - MAX(f.order_date) AS recency_days,
        COUNT(DISTINCT f.order_number) AS frequency,
        SUM(f.sales_amount) AS monetary
    FROM gold.fact_sales f
    JOIN gold.dim_customers c
        ON f.customer_key = c.customer_key
    CROSS JOIN max_date
    WHERE f.order_date IS NOT NULL
    GROUP BY
        c.customer_key,
        c.customer_number,
        c.first_name,
        c.last_name,
        c.country,
        max_date.reference_date
)
SELECT
    customer_key,
    customer_number,
    first_name,
    last_name,
    country,
    recency_days,
    frequency,
    monetary,
    CASE
        WHEN monetary >= 10000 AND frequency >= 4 THEN 'VIP Customer'
        WHEN frequency >= 3 THEN 'Loyal Customer'
        WHEN recency_days <= 90 THEN 'Recent Customer'
        WHEN recency_days > 365 THEN 'At Risk Customer'
        ELSE 'Regular Customer'
    END AS customer_segment
FROM rfm;
```

---

## 9. `scripts/analytics/09_customer_profile.sql`

Purpose:

Create a demographic customer profile view by gender, marital status and age group.

Expected view:

```text
analytics.customer_profile
```

Content:

```sql
CREATE OR REPLACE VIEW analytics.customer_profile AS
SELECT
    c.gender,
    c.marital_status,
    CASE
        WHEN c.birthdate IS NULL THEN 'Unknown'
        WHEN EXTRACT(YEAR FROM AGE(c.birthdate)) < 25 THEN 'Under 25'
        WHEN EXTRACT(YEAR FROM AGE(c.birthdate)) BETWEEN 25 AND 34 THEN '25-34'
        WHEN EXTRACT(YEAR FROM AGE(c.birthdate)) BETWEEN 35 AND 44 THEN '35-44'
        WHEN EXTRACT(YEAR FROM AGE(c.birthdate)) BETWEEN 45 AND 54 THEN '45-54'
        WHEN EXTRACT(YEAR FROM AGE(c.birthdate)) >= 55 THEN '55+'
        ELSE 'Unknown'
    END AS age_group,
    COUNT(DISTINCT c.customer_key) AS customers,
    COUNT(DISTINCT f.order_number) AS orders,
    SUM(f.sales_amount) AS revenue,
    ROUND(SUM(f.sales_amount)::numeric / NULLIF(COUNT(DISTINCT c.customer_key), 0), 2) AS revenue_per_customer
FROM gold.dim_customers c
LEFT JOIN gold.fact_sales f
    ON c.customer_key = f.customer_key
GROUP BY
    c.gender,
    c.marital_status,
    age_group
ORDER BY revenue DESC NULLS LAST;
```

---

## 10. `scripts/analytics/10_business_insights.sql`

Purpose:

Create a strategic summary view containing the most important business insights.

Expected view:

```text
analytics.business_insights
```

Content:

```sql
CREATE OR REPLACE VIEW analytics.business_insights AS
WITH total_revenue AS (
    SELECT SUM(sales_amount) AS revenue
    FROM gold.fact_sales
),
bikes_revenue AS (
    SELECT SUM(f.sales_amount) AS revenue
    FROM gold.fact_sales f
    JOIN gold.dim_products p
        ON f.product_key = p.product_key
    WHERE p.category = 'Bikes'
),
best_country AS (
    SELECT
        c.country,
        SUM(f.sales_amount) AS revenue,
        COUNT(DISTINCT c.customer_key) AS customers,
        ROUND(SUM(f.sales_amount)::numeric / NULLIF(COUNT(DISTINCT c.customer_key), 0), 2) AS revenue_per_customer
    FROM gold.fact_sales f
    JOIN gold.dim_customers c
        ON f.customer_key = c.customer_key
    GROUP BY c.country
    ORDER BY revenue_per_customer DESC
    LIMIT 1
),
best_margin_category AS (
    SELECT
        p.category,
        SUM(f.sales_amount) AS revenue,
        SUM(f.quantity * p.cost) AS estimated_cost,
        SUM(f.sales_amount) - SUM(f.quantity * p.cost) AS estimated_margin,
        ROUND(
            (SUM(f.sales_amount) - SUM(f.quantity * p.cost))::numeric
            / NULLIF(SUM(f.sales_amount), 0) * 100,
            2
        ) AS margin_percentage
    FROM gold.fact_sales f
    JOIN gold.dim_products p
        ON f.product_key = p.product_key
    GROUP BY p.category
    ORDER BY margin_percentage DESC
    LIMIT 1
),
customer_frequency AS (
    SELECT
        customer_key,
        COUNT(DISTINCT order_number) AS frequency
    FROM gold.fact_sales
    GROUP BY customer_key
),
retention AS (
    SELECT
        COUNT(*) AS total_customers,
        COUNT(*) FILTER (WHERE frequency = 1) AS one_time_customers,
        COUNT(*) FILTER (WHERE frequency <= 2) AS low_frequency_customers
    FROM customer_frequency
),
growth_year AS (
    SELECT
        EXTRACT(YEAR FROM order_date)::int AS sales_year,
        SUM(sales_amount) AS revenue
    FROM gold.fact_sales
    WHERE order_date IS NOT NULL
    GROUP BY EXTRACT(YEAR FROM order_date)
    ORDER BY revenue DESC
    LIMIT 1
)
SELECT
    tr.revenue AS total_revenue,
    ROUND(br.revenue::numeric / NULLIF(tr.revenue, 0) * 100, 2) AS bikes_revenue_percentage,
    bc.country AS best_country,
    bc.revenue_per_customer AS best_country_revenue_per_customer,
    bmc.category AS highest_margin_category,
    bmc.margin_percentage AS highest_margin_percentage,
    r.one_time_customers,
    ROUND(r.one_time_customers::numeric / NULLIF(r.total_customers, 0) * 100, 2) AS one_time_customers_percentage,
    r.low_frequency_customers,
    ROUND(r.low_frequency_customers::numeric / NULLIF(r.total_customers, 0) * 100, 2) AS low_frequency_customers_percentage,
    gy.sales_year AS best_revenue_year,
    gy.revenue AS best_year_revenue
FROM total_revenue tr
CROSS JOIN bikes_revenue br
CROSS JOIN best_country bc
CROSS JOIN best_margin_category bmc
CROSS JOIN retention r
CROSS JOIN growth_year gy;
```

---

# 11. `scripts/analytics/README.md`

Create a README file inside the analytics folder.

Content:

````md
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
````

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

````

---

# Final Expected Result

After implementation, the project must contain:

```text
scripts/analytics/
├── 01_create_analytics_schema.sql
├── 02_kpi_overview.sql
├── 03_sales_trend.sql
├── 04_country_performance.sql
├── 05_margin_analysis.sql
├── 06_product_pareto.sql
├── 07_customer_retention.sql
├── 08_customer_rfm.sql
├── 09_customer_profile.sql
├── 10_business_insights.sql
└── README.md
````

No existing file should be deleted or renamed.

The Analytics Layer must be fully independent, reusable, and ready to serve the future FastAPI backend and dashboard frontend.
