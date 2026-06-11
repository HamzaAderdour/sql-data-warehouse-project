-- =============================================================
-- Analytics Layer
-- File: 08_customer_rfm.sql
-- Purpose: RFM customer segmentation view
-- View: analytics.customer_rfm
-- Depends on: gold.fact_sales, gold.dim_customers
-- Note: Uses MAX(order_date) as reference date (historical dataset)
-- =============================================================

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
