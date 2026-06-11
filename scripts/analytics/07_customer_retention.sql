-- =============================================================
-- Analytics Layer
-- File: 07_customer_retention.sql
-- Purpose: Purchase frequency distribution view to analyze customer retention
-- View: analytics.customer_retention
-- Depends on: gold.fact_sales
-- =============================================================

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
