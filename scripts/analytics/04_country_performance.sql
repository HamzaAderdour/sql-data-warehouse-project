-- =============================================================
-- Analytics Layer
-- File: 04_country_performance.sql
-- Purpose: Country-level performance view to identify the strongest markets
-- View: analytics.country_performance
-- Depends on: gold.fact_sales, gold.dim_customers
-- =============================================================

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
